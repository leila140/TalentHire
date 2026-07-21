import { Request, Response, NextFunction } from "express";
import {
  analyzeResume,
  matchCandidate,
  extractTextFromPdf,
  generateInterviewQuestions,
  generateCoverLetter,
  generateRecommendedJobs,
} from "@services/ai.service";
import { ResumeAnalysis } from "@models/ResumeAnalysis";
import { Application } from "@models/Application";
import { User } from "@models/User";
import { Job } from "@models/Job";
import { AppError } from "@middlewares/errorHandler";
import fs from "fs";

export const analyzeResumeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let resumeText = "";

    if (req.file) {
      const buffer = fs.readFileSync(req.file.path);
      resumeText = await extractTextFromPdf(buffer);
      fs.unlinkSync(req.file.path);
    } else if (req.body.resumeUrl) {
      const user = await User.findById(req.user!.id);
      resumeText = user
        ? [
            user.fullName,
            `Skills: ${user.skills?.join(", ")}`,
            `Experience: ${user.experience?.map((e) => `${e.title} at ${e.company}: ${e.description || ""}`).join("\n")}`,
            `Education: ${user.education?.map((e) => `${e.degree} in ${e.field} at ${e.institution}`).join("\n")}`,
          ].join("\n")
        : "";
    } else {
      const user = await User.findById(req.user!.id);
      resumeText = user
        ? [
            user.fullName,
            `Skills: ${user.skills?.join(", ")}`,
            `Experience: ${user.experience?.map((e) => `${e.title} at ${e.company}: ${e.description || ""}`).join("\n")}`,
            `Education: ${user.education?.map((e) => `${e.degree} in ${e.field} at ${e.institution}`).join("\n")}`,
          ].join("\n")
        : "";
    }

    if (!resumeText.trim()) throw new AppError("Could not extract text from resume", 400);

    const resumeUrl = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : req.body.resumeUrl || "";

    const existing = await ResumeAnalysis.findOne({ candidate: req.user!.id, resumeUrl });
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    const analysis = await analyzeResume(resumeText);

    const saved = await ResumeAnalysis.create({
      candidate: req.user!.id,
      resumeUrl,
      extractedText: resumeText.slice(0, 10000),
      ...analysis,
    });

    res.status(200).json({ success: true, data: saved });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

export const matchCandidateHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const app = await Application.findById(applicationId).populate("candidate job");
    if (!app) throw new AppError("Application not found", 404);

    const candidate = await User.findById(app.candidate);
    const job = await Job.findById(app.job);
    if (!candidate || !job) throw new AppError("Candidate or Job not found", 404);

    if (job.createdBy.toString() !== req.user!.id) {
      throw new AppError("You can only analyze candidates for your own jobs", 403);
    }

    const candidateProfile = [
      `Name: ${candidate.fullName}`,
      `Title: ${candidate.title || "N/A"}`,
      `Skills: ${candidate.skills?.join(", ")}`,
      `Experience: ${candidate.experience?.map((e) => `${e.title} at ${e.company}: ${e.description || ""}`).join("\n")}`,
      `Education: ${candidate.education?.map((e) => `${e.degree} in ${e.field} at ${e.institution}`).join("\n")}`,
      `Languages: ${candidate.languages?.map((l) => `${l.language} (${l.level})`).join(", ")}`,
    ].join("\n");

    const jobDescription = [
      `Title: ${job.title}`,
      `Description: ${job.description}`,
      `Required Skills: ${job.requiredSkills?.join(", ")}`,
      `Experience: ${job.experienceMin}-${job.experienceMax} years`,
      `Location: ${job.location}`,
      `Work Mode: ${job.workMode}`,
    ].join("\n");

    const result = await matchCandidate(candidateProfile, jobDescription);

    app.aiScore = result.matchScore || 0;
    app.aiFeedback = {
      overallScore: result.matchScore || 0,
      missingSkills: result.missingSkills || [],
      strongSkills: result.matchedSkills || [],
      weakPoints: result.missingSkills || [],
      suggestions: result.reasons || [],
    };
    await app.save();

    res.status(200).json({ success: true, data: app.aiFeedback });
  } catch (error) {
    next(error);
  }
};

export const generateQuestionsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { applicationId } = req.params;
    const app = await Application.findById(applicationId).populate("candidate job");
    if (!app) throw new AppError("Application not found", 404);

    const candidate = await User.findById(app.candidate);
    const job = await Job.findById(app.job);
    if (!candidate || !job) throw new AppError("Candidate or Job not found", 404);

    if (job.createdBy.toString() !== req.user!.id) {
      throw new AppError("You can only generate questions for your own jobs", 403);
    }

    const candidateProfile = [
      `Name: ${candidate.fullName}`,
      `Skills: ${candidate.skills?.join(", ")}`,
      `Experience: ${candidate.experience?.map((e) => `${e.title} at ${e.company}`).join("\n")}`,
      `Education: ${candidate.education?.map((e) => `${e.degree} in ${e.field}`).join("\n")}`,
    ].join("\n");

    const jobDescription = [
      `Title: ${job.title}`,
      `Description: ${job.description}`,
      `Required Skills: ${job.requiredSkills?.join(", ")}`,
    ].join("\n");

    const result = await generateInterviewQuestions(candidateProfile, jobDescription);

    res.status(200).json({ success: true, data: result.questions });
  } catch (error) {
    next(error);
  }
};

export const generateCoverLetterHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { jobId } = req.body;
    const candidate = await User.findById(req.user!.id);
    const job = await Job.findById(jobId);
    if (!candidate || !job) throw new AppError("Candidate or Job not found", 404);

    const candidateInfo = [
      `Name: ${candidate.fullName}`,
      `Title: ${candidate.title || "N/A"}`,
      `Skills: ${candidate.skills?.join(", ")}`,
      `Experience: ${candidate.experience?.map((e) => `${e.title} at ${e.company}: ${e.description || ""}`).join("\n")}`,
      `Education: ${candidate.education?.map((e) => `${e.degree} in ${e.field} at ${e.institution}`).join("\n")}`,
    ].join("\n");

    const jobDescription = [
      `Title: ${job.title}`,
      `Description: ${job.description}`,
      `Required Skills: ${job.requiredSkills?.join(", ")}`,
      `Company: ${(job.company as any)?.name || "the company"}`,
    ].join("\n");

    const result = await generateCoverLetter(candidateInfo, jobDescription);

    res.status(200).json({ success: true, data: result.coverLetter });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedJobsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidate = await User.findById(req.user!.id);
    if (!candidate) throw new AppError("User not found", 404);

    const activeJobs = await Job.find({ isActive: true })
      .populate("company", "name logo location")
      .limit(20)
      .sort({ createdAt: -1 });

    if (activeJobs.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const candidateProfile = [
      `Name: ${candidate.fullName}`,
      `Title: ${candidate.title || "N/A"}`,
      `Skills: ${candidate.skills?.join(", ")}`,
      `Experience: ${candidate.experience?.map((e) => `${e.title} at ${e.company}`).join("\n")}`,
      `Location: ${candidate.location || "N/A"}`,
    ].join("\n");

    const jobsText = activeJobs.map((j) =>
      `ID: ${j._id}\nTitle: ${j.title}\nSkills: ${j.requiredSkills?.join(", ")}\nLocation: ${j.location}\nMode: ${j.workMode}\nExp: ${j.experienceMin}-${j.experienceMax} years`
    ).join("\n\n");

    const result = await generateRecommendedJobs(candidateProfile, jobsText);

    const recommendations = (result.recommendations || [])
      .map((rec) => {
        const job = activeJobs.find((j) => j._id.toString() === rec.jobId);
        if (!job) return null;
        return { job, score: rec.score, reason: rec.reason };
      })
      .filter(Boolean);

    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};
