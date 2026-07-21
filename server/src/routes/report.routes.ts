import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import {
  generateReport,
  getReports,
  getReport,
  deleteReport,
} from "@controllers/report.controller";
import { validate, reportIdParam } from "@validators/common";
import { generateReportSchema } from "@validators/report.validator";
import { paginationQuery } from "@validators/common";

const router = Router();

router.use(authenticate);
router.use(authorize("admin"));

router.post("/", validate(generateReportSchema), generateReport);
router.get("/", validate({ query: paginationQuery }), getReports);
router.get("/:id", validate({ params: reportIdParam }), getReport);
router.delete("/:id", validate({ params: reportIdParam }), deleteReport);

export default router;
