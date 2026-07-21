import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { searchCandidates } from "@controllers/candidate.controller";
import { validate, searchQuery } from "@validators/common";

const router = Router();

router.get("/", authenticate, authorize("recruiter"), validate({ query: searchQuery }), searchCandidates);

export default router;
