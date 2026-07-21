import { Router } from "express";
import authRoutes from "./auth.routes";
import profileRoutes from "./profile.routes";
import companyRoutes from "./company.routes";
import jobRoutes from "./job.routes";
import applicationRoutes from "./application.routes";
import aiRoutes from "./ai.routes";
import messageRoutes from "./message.routes";
import savedJobRoutes from "./savedJob.routes";
import uploadRoutes from "./upload.routes";
import notificationRoutes from "./notification.routes";
import interviewRoutes from "./interview.routes";
import candidateRoutes from "./candidate.routes";
import adminRoutes from "./admin.routes";
import reportRoutes from "./report.routes";
import activityRoutes from "./activity.routes";
import skillRoutes from "./skill.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/companies", companyRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", applicationRoutes);
router.use("/ai", aiRoutes);
router.use("/messages", messageRoutes);
router.use("/saved-jobs", savedJobRoutes);
router.use("/upload", uploadRoutes);
router.use("/notifications", notificationRoutes);
router.use("/interviews", interviewRoutes);
router.use("/candidates", candidateRoutes);
router.use("/admin", adminRoutes);
router.use("/reports", reportRoutes);
router.use("/activity", activityRoutes);
router.use("/skills", skillRoutes);

export default router;
