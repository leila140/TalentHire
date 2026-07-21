import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import {
  scheduleInterview,
  getJobInterviews,
  getMyInterviews,
  getInterview,
  updateInterview,
  cancelInterview,
  confirmInterview,
  completeInterview,
} from "@controllers/interview.controller";
import { validate, objectIdParam, jobIdParam } from "@validators/common";
import { scheduleInterviewSchema, updateInterviewSchema } from "@validators/interview.validator";

const router = Router();

router.use(authenticate);

router.post("/", authorize("recruiter"), validate({ body: scheduleInterviewSchema }), scheduleInterview);
router.get("/job/:jobId", authorize("recruiter"), validate({ params: jobIdParam }), getJobInterviews);
router.get("/me", authorize("candidate"), getMyInterviews);
router.get("/:id", validate({ params: objectIdParam }), getInterview);
router.patch("/:id", authorize("recruiter"), validate({ params: objectIdParam, body: updateInterviewSchema }), updateInterview);
router.patch("/:id/cancel", authorize("recruiter"), validate({ params: objectIdParam }), cancelInterview);
router.patch("/:id/confirm", authorize("candidate"), validate({ params: objectIdParam }), confirmInterview);
router.patch("/:id/complete", authorize("recruiter"), validate({ params: objectIdParam }), completeInterview);

export default router;
