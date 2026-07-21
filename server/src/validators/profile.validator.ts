import { z } from "zod";

export const educationSchema = z.object({
  institution: z.string().min(1),
  degree: z.string().min(1),
  field: z.string().min(1),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  current: z.boolean().default(false),
});

export const experienceSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().optional().transform((s) => (s ? new Date(s) : undefined)),
  current: z.boolean().default(false),
});

export const languageSchema = z.object({
  language: z.string().min(1),
  level: z.enum(["beginner", "intermediate", "advanced", "native"]),
});

export const certificateSchema = z.object({
  name: z.string().min(1),
  issuer: z.string().min(1),
  url: z.string().url().optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  education: z.array(educationSchema).optional(),
  experience: z.array(experienceSchema).optional(),
  languages: z.array(languageSchema).optional(),
  certificates: z.array(certificateSchema).optional(),
  portfolio: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  resumeUrl: z.string().url().optional().or(z.literal("")),
});
