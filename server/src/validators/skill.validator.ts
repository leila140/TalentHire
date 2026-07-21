import { z } from "zod";

export const seedSkillsSchema = z.object({
  body: z.object({
    skills: z.array(z.object({
      name: z.string().min(1, "Skill name is required"),
      category: z.string().min(1, "Category is required"),
    })).min(1, "At least one skill is required"),
  }),
});

export type SeedSkillsInput = z.infer<typeof seedSkillsSchema>;
