import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { searchSkills, getPopularSkills, seedSkills } from "@controllers/skill.controller";
import { validate, paginationQuery } from "@validators/common";
import { seedSkillsSchema } from "@validators/skill.validator";

const router = Router();

router.get("/", validate({ query: paginationQuery }), searchSkills);
router.get("/popular", validate({ query: paginationQuery }), getPopularSkills);
router.post("/seed", authenticate, authorize("admin"), validate(seedSkillsSchema), seedSkills);

export default router;
