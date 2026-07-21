import { z } from "zod";

export const saveJobSchema = z.object({
  body: z.object({
    jobId: z.string().regex(/^[a-f0-9]{24}$/, "Invalid job ID format"),
  }),
});

export type SaveJobInput = z.infer<typeof saveJobSchema>;
