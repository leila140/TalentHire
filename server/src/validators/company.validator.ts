import { z } from "zod";

export const createCompanySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  industry: z.string().min(1),
  employees: z.number().min(1),
  location: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
  benefits: z.array(z.string()).optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
