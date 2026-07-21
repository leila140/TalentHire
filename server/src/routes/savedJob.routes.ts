import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { saveJob, unsaveJob, getSavedJobs } from "@controllers/savedJob.controller";
import { validate } from "@validators/common";
import { saveJobSchema } from "@validators/savedJob.validator";
import { jobIdParam } from "@validators/common";

const router = Router();

router.use(authenticate);
router.use(authorize("candidate"));

router.get("/", getSavedJobs);
router.post("/", validate(saveJobSchema), saveJob);
router.delete("/:jobId", validate({ params: jobIdParam }), unsaveJob);

export default router;
