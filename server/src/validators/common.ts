import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const objectIdRegex = /^[a-f0-9]{24}$/;

export const objectIdParam = z.object({
  id: z.string().regex(objectIdRegex, "Invalid ID format"),
});

export const jobIdParam = z.object({
  jobId: z.string().regex(objectIdRegex, "Invalid job ID format"),
});

export const applicationIdParam = z.object({
  applicationId: z.string().regex(objectIdRegex, "Invalid application ID format"),
});

export const participantIdParam = z.object({
  participantId: z.string().regex(objectIdRegex, "Invalid user ID format"),
});

export const conversationIdParam = z.object({
  conversationId: z.string().regex(objectIdRegex, "Invalid conversation ID format"),
});

export const imageIdParam = z.object({
  imageId: z.string().regex(objectIdRegex, "Invalid image ID format"),
});

export const userIdParam = z.object({
  userId: z.string().regex(objectIdRegex, "Invalid user ID format"),
});

export const reportIdParam = z.object({
  id: z.string().regex(objectIdRegex, "Invalid report ID format"),
});

export const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const searchQuery = paginationQuery.extend({
  search: z.string().max(200).optional(),
});

export function validate(schema: z.ZodTypeAny | Record<string, z.ZodTypeAny>) {
  return (req: Request, res: Response, next: NextFunction) => {
    let zodSchema: z.ZodTypeAny;

    if (typeof (schema as any).safeParse === "function") {
      zodSchema = schema as z.ZodTypeAny;
    } else {
      const obj = schema as Record<string, z.ZodTypeAny>;
      const shape: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof z.ZodType) {
          shape[key] = value;
        }
      }
      zodSchema = z.object(shape);
    }

    const result = zodSchema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Validation failed";
      return res.status(400).json({ success: false, message });
    }
    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.params !== undefined) req.params = result.data.params;
    if (result.data.query !== undefined) req.query = result.data.query;
    next();
  };
}
