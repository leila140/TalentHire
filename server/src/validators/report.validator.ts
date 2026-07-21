import { z } from "zod";

export const generateReportSchema = z.object({
  body: z.object({
    type: z.enum(["user_stats", "job_stats", "application_stats", "company_stats"], {
      errorMap: () => ({ message: "Invalid report type. Must be user_stats, job_stats, application_stats, or company_stats" }),
    }),
    title: z.string().max(200, "Title is too long").optional(),
  }),
});

export type GenerateReportInput = z.infer<typeof generateReportSchema>;
