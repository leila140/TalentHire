import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { getMyActivityLogs, getAllActivityLogs } from "@controllers/activity.controller";
import { validate, paginationQuery } from "@validators/common";

const router = Router();

router.use(authenticate);

router.get("/me", validate({ query: paginationQuery }), getMyActivityLogs);
router.get("/", authorize("admin"), validate({ query: paginationQuery }), getAllActivityLogs);

export default router;
