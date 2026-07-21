import { z } from "zod";

export const applySchema = z.object({
  jobId: z.string().min(1, "Job ID is required"),
  coverLetter: z.string().max(5000, "Cover letter is too long").optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(["under-review", "interview", "accepted", "rejected"]),
  reason: z.string().max(500, "Reason is too long").optional(),
});

export type ApplyInput = z.infer<typeof applySchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
