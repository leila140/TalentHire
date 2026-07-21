import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
} from "@controllers/message.controller";
import { validate, participantIdParam, conversationIdParam } from "@validators/common";
import { sendMessageSchema } from "@validators/message.validator";
import { paginationQuery } from "@validators/common";

const router = Router();

router.use(authenticate);

router.get("/conversations", validate({ query: paginationQuery }), getMyConversations);
router.get("/conversations/:participantId", validate({ params: participantIdParam }), getOrCreateConversation);
router.get("/conversations/:conversationId/messages", validate({ params: conversationIdParam, query: paginationQuery }), getMessages);
router.post("/conversations/:conversationId/messages", validate({ params: conversationIdParam, body: sendMessageSchema.shape.body }), sendMessage);

export default router;
