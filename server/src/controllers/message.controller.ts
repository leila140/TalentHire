import { Request, Response, NextFunction } from "express";
import { Conversation } from "@models/Conversation";
import { Message } from "@models/Message";
import { Notification } from "@models/Notification";
import { AppError } from "@middlewares/errorHandler";
import { getIO } from "@sockets/index";

export const getOrCreateConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { participantId } = req.params;
    const participants = [req.user!.id, participantId].sort();

    let conversation = await Conversation.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants });
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    next(error);
  }
};

export const getMyConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const [conversations, total] = await Promise.all([
      Conversation.find({ participants: req.user!.id })
        .populate("participants", "fullName avatarUrl role")
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      Conversation.countDocuments({ participants: req.user!.id }),
    ]);

    res.status(200).json({
      success: true,
      data: conversations,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ conversation: req.params.conversationId })
        .populate("sender", "fullName avatarUrl")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ conversation: req.params.conversationId }),
    ]);

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) throw new AppError("Message content is required", 400);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    if (!conversation.participants.some((p) => p.toString() === req.user!.id)) {
      throw new AppError("You are not part of this conversation", 403);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user!.id,
      content: content.trim(),
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.trim(),
      lastMessageAt: new Date(),
    });

    const populated = await message.populate("sender", "fullName avatarUrl");

    const io = getIO();
    io.to(conversationId).emit("message:new", populated);

    const otherParticipant = conversation.participants.find(
      (p) => p.toString() !== req.user!.id
    );
    if (otherParticipant) {
      try {
        const senderName = (populated as any).sender?.fullName || "Someone";
        await Notification.create({
          user: otherParticipant,
          type: "new_message",
          message: `Message from ${senderName}: ${content.trim().slice(0, 80)}`,
          metadata: { conversationId, fromName: senderName, fromId: req.user!.id },
        });
        const unreadCount = await Notification.countDocuments({ user: otherParticipant, isRead: false });
        io.to(`user:${otherParticipant}`).emit("notification:new", { unreadCount });
      } catch (err) {
        console.error("Failed to send notification:", err);
      }
    }

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};
