import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import {
  createJob,
  getJob,
  updateJob,
  deleteJob,
  listJobs,
  getMyJobs,
} from "@controllers/job.controller";
import { validate, objectIdParam } from "@validators/common";
import { createJobSchema, updateJobSchema } from "@validators/job.validator";
import { searchQuery } from "@validators/common";

const router = Router();

router.get("/", validate({ query: searchQuery }), listJobs);
router.get("/me", authenticate, authorize("recruiter"), getMyJobs);
router.get("/:id", validate({ params: objectIdParam }), getJob);
router.post("/", authenticate, authorize("recruiter"), validate({ body: createJobSchema }), createJob);
router.patch("/:id", authenticate, authorize("recruiter"), validate({ params: objectIdParam, body: updateJobSchema }), updateJob);
router.delete("/:id", authenticate, authorize("recruiter"), validate({ params: objectIdParam }), deleteJob);

export default router;
