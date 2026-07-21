import { z } from "zod";

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum(["candidate", "recruiter", "admin"], {
      errorMap: () => ({ message: "Invalid role. Must be candidate, recruiter, or admin" }),
    }),
  }),
});

export const adminUsersQuerySchema = z.object({
  query: z.object({
    search: z.string().max(200).optional(),
    role: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const adminJobsQuerySchema = z.object({
  query: z.object({
    search: z.string().max(200).optional(),
    isActive: z.enum(["true", "false"]).optional(),
    employmentType: z.string().optional(),
    workMode: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const adminCompaniesQuerySchema = z.object({
  query: z.object({
    isApproved: z.enum(["true", "false"]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const adminApplicationsQuerySchema = z.object({
  query: z.object({
    status: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
