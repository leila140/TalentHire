import { z } from "zod";

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  scheduledAt: z.string().min(1, "Date and time is required"),
  duration: z.number().int().min(15, "Minimum 15 minutes").max(480, "Maximum 8 hours").optional(),
  meetingLink: z.string().url("Invalid meeting link").optional(),
  notes: z.string().max(2000, "Notes are too long").optional(),
  aiQuestions: z.array(z.string()).optional(),
});

export const updateInterviewSchema = z.object({
  scheduledAt: z.string().optional(),
  duration: z.number().int().min(15).max(480).optional(),
  meetingLink: z.string().url("Invalid meeting link").optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
