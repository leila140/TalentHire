import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import {
  apply,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  withdrawApplication,
} from "@controllers/application.controller";
import { validate, objectIdParam, jobIdParam } from "@validators/common";
import { applySchema, updateStatusSchema } from "@validators/application.validator";

const router = Router();

router.use(authenticate);

router.post("/", authorize("candidate"), validate({ body: applySchema }), apply);
router.get("/me", authorize("candidate"), getMyApplications);
router.get("/job/:jobId", authorize("recruiter"), validate({ params: jobIdParam }), getJobApplicants);
router.patch("/:id/status", authorize("recruiter"), validate({ params: objectIdParam, body: updateStatusSchema }), updateApplicationStatus);
router.patch("/:id/withdraw", authorize("candidate"), validate({ params: objectIdParam }), withdrawApplication);

export default router;
