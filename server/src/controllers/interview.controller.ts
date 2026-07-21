import { Request, Response, NextFunction } from "express";
import { Interview } from "@models/Interview";
import { Application } from "@models/Application";
import { Job } from "@models/Job";
import { Notification } from "@models/Notification";
import { AppError } from "@middlewares/errorHandler";
import { getIO } from "@sockets/index";
import { User } from "@models/User";
import { scheduleInterviewSchema, updateInterviewSchema } from "@validators/interview.validator";
import { logActivity } from "./activity.controller";
import { sendInterviewScheduledEmail } from "@config/email";
import { parsePagination } from "@utils/helpers";

export const scheduleInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = scheduleInterviewSchema.parse(req.body);
    const application = await Application.findById(input.applicationId).populate("job", "title createdBy");
    if (!application) throw new AppError("Application not found", 404);

    if (application.status === "rejected" || application.status === "withdrawn") {
      throw new AppError("Cannot schedule interview for a rejected or withdrawn application", 400);
    }

    const job = application.job as any;
    if (job.createdBy.toString() !== req.user!.id) {
      throw new AppError("You can only schedule interviews for your own jobs", 403);
    }

    const interview = await Interview.create({
      application: input.applicationId,
      recruiter: req.user!.id,
      candidate: application.candidate,
      scheduledAt: new Date(input.scheduledAt),
      duration: input.duration || 60,
      meetingLink: input.meetingLink,
      notes: input.notes,
      aiQuestions: input.aiQuestions,
      status: "scheduled",
    });

    await Application.findByIdAndUpdate(input.applicationId, { status: "interview" });

    try {
      const recruiterUser = await User.findById(req.user!.id).select("fullName");
      const recruiterName = recruiterUser?.fullName || "A recruiter";
      await Notification.create({
        user: application.candidate,
        type: "interview_scheduled",
        message: `Interview scheduled for "${job.title}" on ${new Date(input.scheduledAt).toLocaleDateString()}`,
        metadata: {
          jobId: job._id.toString(),
          jobTitle: job.title,
          interviewId: interview._id.toString(),
          fromName: recruiterName,
        },
      });
      const unreadCount = await Notification.countDocuments({ user: application.candidate, isRead: false });
      getIO().to(`user:${application.candidate}`).emit("notification:new", { unreadCount });
    } catch (err) {
      console.error("Failed to send interview scheduled notification:", err);
    }

    logActivity(req.user!.id, "interview_schedule", "interview", interview.id, { jobId: job._id.toString(), jobTitle: job.title, candidateId: application.candidate.toString() }, req.ip);

    try {
      const candidateUser = await User.findById(application.candidate).select("fullName email");
      if (candidateUser) {
        sendInterviewScheduledEmail(
          candidateUser.email,
          candidateUser.fullName,
          job.title,
          new Date(input.scheduledAt).toLocaleDateString(),
          input.meetingLink
        );
      }
    } catch (err) {
      console.error("Failed to send interview scheduled email:", err);
    }

    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const getJobInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, createdBy: req.user!.id });
    if (!job) throw new AppError("Job not found", 404);

    const applications = await Application.find({ job: req.params.jobId }).select("_id");
    const applicationIds = applications.map((a) => a._id);

    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });
    const wantsPagination = req.query.page !== undefined || req.query.limit !== undefined;

    const baseQuery = Interview.find({ application: { $in: applicationIds } })
      .populate({ path: "application", select: "status", populate: { path: "job", select: "title" } })
      .populate("candidate", "fullName email avatarUrl")
      .populate("recruiter", "fullName")
      .sort({ scheduledAt: -1 });

    if (wantsPagination) {
      const [interviews, total] = await Promise.all([
        baseQuery.skip(skip).limit(limit),
        Interview.countDocuments({ application: { $in: applicationIds } }),
      ]);
      res.status(200).json({
        success: true,
        data: interviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } else {
      const interviews = await baseQuery;
      res.status(200).json({ success: true, data: interviews });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyInterviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });
    const wantsPagination = req.query.page !== undefined || req.query.limit !== undefined;

    const baseQuery = Interview.find({ candidate: req.user!.id })
      .populate({
        path: "application",
        populate: { path: "job", populate: { path: "company", select: "name logo" } },
      })
      .populate("recruiter", "fullName")
      .sort({ scheduledAt: -1 });

    if (wantsPagination) {
      const [interviews, total] = await Promise.all([
        baseQuery.skip(skip).limit(limit),
        Interview.countDocuments({ candidate: req.user!.id }),
      ]);
      res.status(200).json({
        success: true,
        data: interviews,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } else {
      const interviews = await baseQuery;
      res.status(200).json({ success: true, data: interviews });
    }
  } catch (error) {
    next(error);
  }
};

export const getInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await Interview.findById(req.params.id)
      .populate({
        path: "application",
        populate: { path: "job", select: "title company" },
      })
      .populate("candidate", "fullName email avatarUrl")
      .populate("recruiter", "fullName");

    if (!interview) throw new AppError("Interview not found", 404);

    const userId = req.user!.id;
    const isRecruiter = interview.recruiter._id?.toString() === userId || interview.recruiter.toString() === userId;
    const isCandidate = interview.candidate._id?.toString() === userId || interview.candidate.toString() === userId;
    if (!isRecruiter && !isCandidate) {
      throw new AppError("You are not authorized to view this interview", 403);
    }

    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const updateInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateInterviewSchema.parse(req.body);
    const interview = await Interview.findById(req.params.id).populate({
      path: "application",
      populate: { path: "job", select: "title" },
    });

    if (!interview) throw new AppError("Interview not found", 404);
    if (interview.recruiter.toString() !== req.user!.id) {
      throw new AppError("Only the recruiter can update this interview", 403);
    }
    if (interview.status !== "scheduled") {
      throw new AppError("Cannot update a completed or cancelled interview", 400);
    }

    if (input.scheduledAt) interview.scheduledAt = new Date(input.scheduledAt);
    if (input.duration) interview.duration = input.duration;
    if (input.meetingLink !== undefined) interview.meetingLink = input.meetingLink ?? undefined;
    if (input.notes !== undefined) interview.notes = input.notes ?? undefined;
    await interview.save();

    const job = (interview.application as any).job;
    try {
      await Notification.create({
        user: interview.candidate,
        type: "interview_updated",
        message: `Interview for "${(job as any).title}" has been rescheduled`,
        metadata: {
          jobId: (job as any)._id.toString(),
          jobTitle: (job as any).title,
          interviewId: interview._id.toString(),
        },
      });
      const unreadCount = await Notification.countDocuments({ user: interview.candidate, isRead: false });
      getIO().to(`user:${interview.candidate}`).emit("notification:new", { unreadCount });
    } catch (err) {
      console.error("Failed to send interview updated notification:", err);
    }

    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const cancelInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await Interview.findById(req.params.id).populate({
      path: "application",
      populate: { path: "job", select: "title" },
    });

    if (!interview) throw new AppError("Interview not found", 404);
    if (interview.recruiter.toString() !== req.user!.id) {
      throw new AppError("Only the recruiter can cancel this interview", 403);
    }
    if (interview.status !== "scheduled") {
      throw new AppError("Interview is already completed or cancelled", 400);
    }

    interview.status = "cancelled";
    await interview.save();

    const job = (interview.application as any).job;
    try {
      await Notification.create({
        user: interview.candidate,
        type: "interview_cancelled",
        message: `Interview for "${(job as any).title}" has been cancelled`,
        metadata: {
          jobId: (job as any)._id.toString(),
          jobTitle: (job as any).title,
          interviewId: interview._id.toString(),
        },
      });
      const unreadCount = await Notification.countDocuments({ user: interview.candidate, isRead: false });
      getIO().to(`user:${interview.candidate}`).emit("notification:new", { unreadCount });
    } catch (err) {
      console.error("Failed to send interview cancelled notification:", err);
    }

    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const confirmInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await Interview.findById(req.params.id).populate({
      path: "application",
      populate: { path: "job", select: "title" },
    });

    if (!interview) throw new AppError("Interview not found", 404);
    if (interview.candidate.toString() !== req.user!.id) {
      throw new AppError("Only the candidate can confirm this interview", 403);
    }
    if (interview.status !== "scheduled") {
      throw new AppError("Cannot confirm a completed or cancelled interview", 400);
    }

    interview.notes = interview.notes
      ? `${interview.notes}\n[Candidate confirmed attendance]`
      : "[Candidate confirmed attendance]";
    await interview.save();

    const job = (interview.application as any).job;
    try {
      await Notification.create({
        user: interview.recruiter,
        type: "interview_confirmed",
        message: `Candidate confirmed interview for "${(job as any).title}"`,
        metadata: {
          jobId: (job as any)._id.toString(),
          jobTitle: (job as any).title,
          interviewId: interview._id.toString(),
        },
      });
      const unreadCount = await Notification.countDocuments({ user: interview.recruiter, isRead: false });
      getIO().to(`user:${interview.recruiter}`).emit("notification:new", { unreadCount });
    } catch (err) {
      console.error("Failed to send interview confirmed notification:", err);
    }

    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};

export const completeInterview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) throw new AppError("Interview not found", 404);
    if (interview.recruiter.toString() !== req.user!.id) {
      throw new AppError("Only the recruiter can complete this interview", 403);
    }
    if (interview.status !== "scheduled") {
      throw new AppError("Interview is already completed or cancelled", 400);
    }

    interview.status = "completed";
    await interview.save();

    res.status(200).json({ success: true, data: interview });
  } catch (error) {
    next(error);
  }
};
