import { Request, Response, NextFunction } from "express";
import { Job } from "@models/Job";
import { Company } from "@models/Company";
import { AppError } from "@middlewares/errorHandler";
import { logActivity } from "./activity.controller";
import { escapeRegex, parsePagination } from "@utils/helpers";
import { cascadeDeleteJob } from "@utils/cascade";

export const createJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const company = await Company.findOne({ createdBy: req.user!.id });
    if (!company) throw new AppError("You must create a company first", 400);

    const job = await Job.create({ ...req.body, company: company.id, createdBy: req.user!.id });
    logActivity(req.user!.id, "job_create", "job", job.id, { title: job.title }, req.ip as string);
    res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findById(req.params.id).populate("company", "name logo location");
    if (!job) throw new AppError("Job not found", 404);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user!.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) throw new AppError("Job not found", 404);
    logActivity(req.user!.id, "job_update", "job", String(req.params.id), { title: job.title }, req.ip);
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user!.id });
    if (!job) throw new AppError("Job not found", 404);
    logActivity(req.user!.id, "job_delete", "job", String(req.params.id), { title: job.title }, req.ip);
    await cascadeDeleteJob(String(req.params.id));
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) {
    next(error);
  }
};

export const listJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      search,
      location,
      employmentType,
      workMode,
      skills,
      minSalary,
    } = req.query;

    const { page, limit, skip } = parsePagination({ page: req.query.page, limit: req.query.limit });

    const filter: Record<string, unknown> = { isActive: true, deadline: { $gte: new Date() } };

    if (search) filter.$text = { $search: search as string };
    if (location) filter.location = { $regex: escapeRegex(location as string), $options: "i" };
    if (employmentType) filter.employmentType = employmentType;
    if (workMode) filter.workMode = workMode;
    if (skills) filter.requiredSkills = { $in: (skills as string).split(",") };
    if (minSalary) filter.salaryMin = { $gte: Number(minSalary) };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate("company", "name logo location")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const jobs = await Job.find({ createdBy: req.user!.id }).populate("company", "name logo");
    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    next(error);
  }
};
