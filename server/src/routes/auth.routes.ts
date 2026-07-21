import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  logout,
  refresh,
  verifyEmailHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  googleLoginHandler,
  getMe,
} from "@controllers/auth.controller";
import { authenticate } from "@middlewares/auth.middleware";
import { validate } from "@validators/common";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from "@validators/auth.validator";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts, please try again later" },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many password reset attempts, please try again later" },
});

router.post("/register", authLimiter, validate({ body: registerSchema }), register);
router.post("/login", authLimiter, validate({ body: loginSchema }), login);
router.post("/logout", authenticate, logout);
router.post("/refresh", refresh);
router.get("/verify-email", verifyEmailHandler);
router.post("/forgot-password", passwordResetLimiter, validate({ body: forgotPasswordSchema }), forgotPasswordHandler);
router.post("/reset-password", passwordResetLimiter, validate({ body: resetPasswordSchema }), resetPasswordHandler);
router.post("/google", authLimiter, validate({ body: googleLoginSchema }), googleLoginHandler);
router.get("/me", authenticate, getMe);

export default router;
