import { Request, Response, NextFunction } from "express";
import { SavedJob } from "@models/SavedJob";
import { AppError } from "@middlewares/errorHandler";

export const saveJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.body;
    const existing = await SavedJob.findOne({ candidate: req.user!.id, job: jobId });
    if (existing) throw new AppError("Job already saved", 409);

    const saved = await SavedJob.create({ candidate: req.user!.id, job: jobId });
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};

export const unsaveJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await SavedJob.findOneAndDelete({ candidate: req.user!.id, job: req.params.jobId });
    res.status(200).json({ success: true, message: "Job unsaved" });
  } catch (error) {
    next(error);
  }
};

export const getSavedJobs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const saved = await SavedJob.find({ candidate: req.user!.id })
      .populate({ path: "job", populate: { path: "company", select: "name logo location" } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: saved });
  } catch (error) {
    next(error);
  }
};
