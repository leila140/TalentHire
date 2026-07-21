import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { getProfile, updateProfile, exportResumePdf } from "@controllers/profile.controller";
import { validate, userIdParam } from "@validators/common";
import { updateProfileSchema } from "@validators/profile.validator";

const router = Router();

router.use(authenticate);

router.get("/", getProfile);
router.patch("/", validate({ body: updateProfileSchema }), updateProfile);
router.get("/export-pdf", exportResumePdf);
router.get("/:userId/export-pdf", validate({ params: userIdParam }), exportResumePdf);

export default router;
