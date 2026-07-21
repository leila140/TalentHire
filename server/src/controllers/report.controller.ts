import { Request, Response, NextFunction } from "express";
import { Report } from "@models/Report";
import { User } from "@models/User";
import { Job } from "@models/Job";
import { Application } from "@models/Application";
import { Company } from "@models/Company";
import { AppError } from "@middlewares/errorHandler";

export const generateReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, title } = req.body;

    let data: Record<string, any> = {};

    switch (type) {
      case "user_stats": {
        const [total, byRole, recent] = await Promise.all([
          User.countDocuments(),
          User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
          User.find().sort({ createdAt: -1 }).limit(10).select("fullName email role createdAt"),
        ]);
        data = { total, byRole: byRole.reduce((acc: any, r: any) => { acc[r._id] = r.count; return acc; }, {}), recent };
        break;
      }
      case "job_stats": {
        const [total, active, byType, byWorkMode] = await Promise.all([
          Job.countDocuments(),
          Job.countDocuments({ isActive: true }),
          Job.aggregate([{ $group: { _id: "$employmentType", count: { $sum: 1 } } }]),
          Job.aggregate([{ $group: { _id: "$workMode", count: { $sum: 1 } } }]),
        ]);
        data = { total, active, byType, byWorkMode };
        break;
      }
      case "application_stats": {
        const [total, byStatus, recent] = await Promise.all([
          Application.countDocuments(),
          Application.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
          Application.find().sort({ createdAt: -1 }).limit(10).populate("job", "title").populate("candidate", "fullName"),
        ]);
        data = { total, byStatus: byStatus.reduce((acc: any, s: any) => { acc[s._id] = s.count; return acc; }, {}), recent };
        break;
      }
      case "company_stats": {
        const [total, approved, pending] = await Promise.all([
          Company.countDocuments(),
          Company.countDocuments({ isApproved: true }),
          Company.countDocuments({ isApproved: false }),
        ]);
        data = { total, approved, pending };
        break;
      }
      default:
        throw new AppError("Invalid report type", 400);
    }

    const report = await Report.create({
      type,
      title: title || `${type.replace(/_/g, " ")} report`,
      data,
      generatedBy: req.user!.id,
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(parseInt(req.query.page as string) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find()
        .populate("generatedBy", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await Report.findById(req.params.id).populate("generatedBy", "fullName email");
    if (!report) throw new AppError("Report not found", 404);
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) throw new AppError("Report not found", 404);
    res.status(200).json({ success: true, message: "Report deleted" });
  } catch (error) {
    next(error);
  }
};
