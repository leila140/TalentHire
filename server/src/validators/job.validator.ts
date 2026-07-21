import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(20),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default("USD"),
  location: z.string().min(1),
  employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
  workMode: z.enum(["remote", "hybrid", "on-site"]),
  requiredSkills: z.array(z.string()).min(1),
  experienceMin: z.number().default(0),
  experienceMax: z.number().default(10),
  deadline: z.string().transform((s) => new Date(s)),
});

export const updateJobSchema = createJobSchema.partial();

export type CreateJobInput = z.infer<typeof createJobSchema>;
