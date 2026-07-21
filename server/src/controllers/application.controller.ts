import { Request, Response, NextFunction } from "express";
import { Application } from "@models/Application";
import { Job } from "@models/Job";
import { User } from "@models/User";
import { Notification } from "@models/Notification";
import { AppError } from "@middlewares/errorHandler";
import { getIO } from "@sockets/index";
import { applySchema, updateStatusSchema } from "@validators/application.validator";
import { logActivity } from "./activity.controller";
import { sendNewApplicationEmail } from "@config/email";
import { parsePagination } from "@utils/helpers";

export const apply = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = applySchema.parse(req.body);
    const job = await Job.findById(input.jobId);
    if (!job || !job.isActive) throw new AppError("Job not found or inactive", 404);

    const existing = await Application.findOne({ candidate: req.user!.id, job: input.jobId });
    if (existing) throw new AppError("Already applied to this job", 409);

    const application = await Application.create({
      candidate: req.user!.id,
      job: input.jobId,
      coverLetter: input.coverLetter,
    });

    // Notify the job poster (recruiter)
    try {
      const candidate = await User.findById(req.user!.id).select("fullName");
      const candidateName = candidate?.fullName || "Someone";
      await Notification.create({
        user: job.createdBy,
        type: "new_application",
        message: `${candidateName} applied for "${job.title}"`,
        metadata: { jobId: input.jobId.toString(), jobTitle: job.title, fromName: candidateName, fromId: req.user!.id },
      });
      const unreadCount = await Notification.countDocuments({ user: job.createdBy, isRead: false });
      getIO().to(`user:${job.createdBy}`).emit("notification:new", { unreadCount });

      const recruiterUser = await User.findById(job.createdBy).select("fullName email");
      if (recruiterUser) {
        sendNewApplicationEmail(recruiterUser.email, recruiterUser.fullName, candidateName, job.title);
      }
    } catch (err) {
      console.error("Failed to send application notification:", err);
    }

    logActivity(req.user!.id, "apply", "application", application.id, { jobId: input.jobId.toString(), jobTitle: job.title }, req.ip);

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });
    const wantsPagination = req.query.page !== undefined || req.query.limit !== undefined;

    const baseQuery = Application.find({ candidate: req.user!.id })
      .populate({ path: "job", populate: { path: "company", select: "name logo location" } })
      .sort({ createdAt: -1 });

    if (wantsPagination) {
      const [apps, total] = await Promise.all([
        baseQuery.skip(skip).limit(limit),
        Application.countDocuments({ candidate: req.user!.id }),
      ]);
      res.status(200).json({
        success: true,
        data: apps,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } else {
      const apps = await baseQuery;
      res.status(200).json({ success: true, data: apps });
    }
  } catch (error) {
    next(error);
  }
};

export const getJobApplicants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user!.id });
    if (!job) throw new AppError("Job not found", 404);

    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });
    const wantsPagination = req.query.page !== undefined || req.query.limit !== undefined;

    const baseQuery = Application.find({ job: req.params.jobId })
      .populate("candidate", "fullName email resumeUrl avatarUrl skills")
      .sort({ createdAt: -1 });

    if (wantsPagination) {
      const [apps, total] = await Promise.all([
        baseQuery.skip(skip).limit(limit),
        Application.countDocuments({ job: req.params.jobId }),
      ]);
      res.status(200).json({
        success: true,
        data: apps,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } else {
      const apps = await baseQuery;
      res.status(200).json({ success: true, data: apps });
    }
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateStatusSchema.parse(req.body);
    const update: Record<string, any> = { status: input.status };
    if (input.reason) update.rejectionReason = input.reason;
    const app = await Application.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!app) throw new AppError("Application not found", 404);

    // Notify the candidate about the status update
    try {
      const job = await Job.findById(app.job).select("title");
      const label = input.status === "rejected" && input.reason ? ` (reason: ${input.reason})` : "";
      const message = `Your application for "${job?.title || "a job"}" is now ${input.status.replace("-", " ")}${label}`;
      await Notification.create({
        user: app.candidate,
        type: "status_update",
        message,
        metadata: {
          jobId: app.job.toString(),
          jobTitle: job?.title || "",
          status: input.status,
        },
      });
      const unreadCount = await Notification.countDocuments({ user: app.candidate, isRead: false });
      getIO().to(`user:${app.candidate}`).emit("notification:new", { unreadCount });
    } catch (err) {
      console.error("Failed to send status update notification:", err);
    }

    logActivity(req.user!.id, "status_update", "application", req.params.id as string, { status: input.status }, req.ip);

    res.status(200).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};

export const withdrawApplication = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, candidate: req.user!.id },
      { status: "withdrawn" },
      { new: true }
    );
    if (!app) throw new AppError("Application not found", 404);
    logActivity(req.user!.id, "withdraw", "application", req.params.id as string, {}, req.ip);
    res.status(200).json({ success: true, data: app });
  } catch (error) {
    next(error);
  }
};
