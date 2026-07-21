import { z } from "zod";

export const analyzeResumeSchema = z.object({
  body: z.object({
    resumeUrl: z.string().url("Invalid URL").optional(),
  }).refine((data) => data.resumeUrl !== undefined, {
    message: "resumeUrl is required when no file is uploaded",
  }).optional(),
});

export const coverLetterSchema = z.object({
  body: z.object({
    jobId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid job ID format"),
  }),
});

export type CoverLetterInput = z.infer<typeof coverLetterSchema>;
