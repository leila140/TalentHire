import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { Message } from "@models/Message";
import { Conversation } from "@models/Conversation";
import { Notification } from "@models/Notification";

interface AuthSocket extends Socket {
  userId?: string;
}

let io: Server;

export const getIO = () => io;

export const registerSocketHandlers = (server: Server) => {
  io = server;

  io.use((socket: AuthSocket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error("Authentication required"));

    try {
      const decoded = jwt.verify(token as string, env.jwt.accessSecret) as {
        id: string;
      };
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    console.log(`User ${socket.userId} connected`);

    // Join user's personal room for direct notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    socket.on("conversation:join", (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on("message:send", async ({ conversationId, content }) => {
      const message = await Message.create({
        conversation: conversationId,
        sender: socket.userId,
        content,
      });

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: content,
        lastMessageAt: new Date(),
      });

      const populated = await message.populate("sender", "fullName avatarUrl");

      io.to(conversationId).emit("message:new", populated);
      io.to(conversationId).emit("conversation:typing", {
        conversationId,
        userId: null,
      });

      // Notify the other participant
      const otherParticipant = conversation.participants.find(
        (p) => p.toString() !== socket.userId
      );
      if (otherParticipant) {
        const senderName = (message as any).sender?.fullName || "Someone";
        await Notification.create({
          user: otherParticipant,
          type: "new_message",
          message: `Message from ${senderName}: ${content.slice(0, 80)}`,
          metadata: { conversationId, fromName: senderName, fromId: socket.userId },
        });
        const unreadCount = await Notification.countDocuments({ user: otherParticipant, isRead: false });
        io.to(`user:${otherParticipant}`).emit("notification:new", { unreadCount });
      }
    });

    socket.on("conversation:leave", (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on("conversation:typing", ({ conversationId }) => {
      socket.to(conversationId).emit("conversation:typing", {
        conversationId,
        userId: socket.userId,
      });
    });

    socket.on("message:read", async ({ conversationId, messageIds }) => {
      await Message.updateMany(
        { _id: { $in: messageIds }, conversation: conversationId },
        { isRead: true }
      );
      io.to(conversationId).emit("messages:read", {
        conversationId,
        userId: socket.userId,
      });
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
    });
  });
};
