import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import {
  getUnreadCount,
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "@controllers/notification.controller";
import { validate, objectIdParam } from "@validators/common";
import { paginationQuery } from "@validators/common";

const router = Router();

router.use(authenticate);

router.get("/count", getUnreadCount);
router.get("/", validate({ query: paginationQuery }), getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", validate({ params: objectIdParam }), markAsRead);

export default router;
