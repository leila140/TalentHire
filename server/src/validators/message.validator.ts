import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Message content is required").max(5000, "Message is too long"),
  }),
});

export const paginationQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
