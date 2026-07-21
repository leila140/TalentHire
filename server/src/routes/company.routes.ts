import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import { uploadAvatar } from "@middlewares/upload";
import {
  createCompany,
  getMyCompany,
  getCompany,
  getCompanyJobs,
  updateCompany,
  listCompanies,
  addGalleryImage,
  removeGalleryImage,
} from "@controllers/company.controller";
import { validate, objectIdParam, imageIdParam } from "@validators/common";
import { createCompanySchema, updateCompanySchema } from "@validators/company.validator";
import { paginationQuery } from "@validators/common";

const router = Router();

router.get("/", validate({ query: paginationQuery }), listCompanies);
router.get("/me", authenticate, authorize("recruiter"), getMyCompany);
router.get("/:id", validate({ params: objectIdParam }), getCompany);
router.get("/:id/jobs", validate({ params: objectIdParam, query: paginationQuery }), getCompanyJobs);
router.post("/", authenticate, authorize("recruiter"), validate({ body: createCompanySchema }), createCompany);
router.patch("/:id", authenticate, authorize("recruiter"), validate({ params: objectIdParam, body: updateCompanySchema }), updateCompany);
router.post("/gallery", authenticate, authorize("recruiter"), uploadAvatar, addGalleryImage);
router.delete("/gallery/:imageId", authenticate, authorize("recruiter"), validate({ params: imageIdParam }), removeGalleryImage);

export default router;
