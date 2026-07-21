import { Request, Response, NextFunction } from "express";
import { ActivityLog } from "@models/ActivityLog";

export const logActivity = async (
  userId: string,
  action: string,
  entity: string,
  entityId?: string,
  metadata?: Record<string, any>,
  ip?: string
) => {
  try {
    await ActivityLog.create({ user: userId, action, entity, entityId: entityId ? String(entityId) : undefined, metadata, ip });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

export const getMyActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      ActivityLog.find({ user: req.user!.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments({ user: req.user!.id }),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (req.query.entity) filter.entity = req.query.entity;
    if (req.query.action) filter.action = req.query.action;
    if (req.query.userId) filter.user = req.query.userId;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate("user", "fullName email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ActivityLog.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};
