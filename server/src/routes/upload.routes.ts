import { Router } from "express";
import { authenticate } from "@middlewares/auth.middleware";
import { uploadAvatar, uploadResume } from "@middlewares/upload";
import {
  uploadAvatarHandler,
  uploadResumeHandler,
  deleteAvatarHandler,
  deleteResumeHandler,
} from "@controllers/upload.controller";

const router = Router();

router.use(authenticate);

router.post("/avatar", uploadAvatar, uploadAvatarHandler);
router.delete("/avatar", deleteAvatarHandler);
router.post("/resume", uploadResume, uploadResumeHandler);
router.delete("/resume", deleteResumeHandler);

export default router;
