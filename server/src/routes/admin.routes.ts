import { Router } from "express";
import { authenticate, authorize } from "@middlewares/auth.middleware";
import {
  getStats,
  getUsers,
  updateUserRole,
  deleteUser,
  getCompanies,
  approveCompany,
  getJobs,
  deleteJob,
  getApplications,
  deleteCompany,
  deleteApplication,
  getAnalytics,
} from "@controllers/admin.controller";
import { validate, objectIdParam } from "@validators/common";
import {
  updateUserRoleSchema,
  adminUsersQuerySchema,
  adminJobsQuerySchema,
  adminCompaniesQuerySchema,
  adminApplicationsQuerySchema,
} from "@validators/admin.validator";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/stats", getStats);
router.get("/analytics", getAnalytics);
router.get("/users", validate(adminUsersQuerySchema), getUsers);
router.patch("/users/:id/role", validate({ params: objectIdParam, body: updateUserRoleSchema.shape.body }), updateUserRole);
router.delete("/users/:id", validate({ params: objectIdParam }), deleteUser);
router.get("/companies", validate(adminCompaniesQuerySchema), getCompanies);
router.patch("/companies/:id/approve", validate({ params: objectIdParam }), approveCompany);
router.delete("/companies/:id", validate({ params: objectIdParam }), deleteCompany);
router.get("/jobs", validate(adminJobsQuerySchema), getJobs);
router.delete("/jobs/:id", validate({ params: objectIdParam }), deleteJob);
router.get("/applications", validate(adminApplicationsQuerySchema), getApplications);
router.delete("/applications/:id", validate({ params: objectIdParam }), deleteApplication);

export default router;
