import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { uploadPdf } from "@middlewares/upload";
import {
  analyzeResumeHandler,
  matchCandidateHandler,
  generateQuestionsHandler,
  generateCoverLetterHandler,
  getRecommendedJobsHandler,
} from "@controllers/ai.controller";
import { validate, applicationIdParam } from "@validators/common";
import { coverLetterSchema } from "@validators/ai.validator";

const router = Router();

router.use(authenticate);

router.post("/analyze-resume", authorize("candidate"), uploadPdf, analyzeResumeHandler);
router.get("/match/:applicationId", authorize("recruiter"), validate({ params: applicationIdParam }), matchCandidateHandler);
router.get("/questions/:applicationId", authorize("recruiter"), validate({ params: applicationIdParam }), generateQuestionsHandler);
router.post("/cover-letter", authorize("candidate"), validate(coverLetterSchema), generateCoverLetterHandler);
router.get("/recommended-jobs", authorize("candidate"), getRecommendedJobsHandler);

export default router;
