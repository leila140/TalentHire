import { Request, Response, NextFunction } from "express";
import { Notification } from "@models/Notification";

export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await Notification.countDocuments({ user: req.user!.id, isRead: false });
    res.status(200).json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ user: req.user!.id }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user!.id },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Notification.updateMany(
      { user: req.user!.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
