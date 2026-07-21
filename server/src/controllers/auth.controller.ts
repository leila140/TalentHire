import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@validators/auth.validator";
import {
  registerUser,
  loginUser,
  refreshTokenService,
  logoutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
} from "@services/auth.service";
import { User } from "@models/User";
import { env } from "@config/env";
import { AppError } from "@middlewares/errorHandler";
import { logActivity } from "./activity.controller";

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  path: "/",
};

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = registerSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await registerUser(input);

    setAuthCookies(res, accessToken, refreshToken);

    logActivity(user.id, "register", "user", user.id, { email: user.email }, req.ip as string);

    res.status(201).json({
      success: true,
      data: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await loginUser(input);

    setAuthCookies(res, accessToken, refreshToken);

    logActivity(user.id, "login", "user", user.id, {}, req.ip as string);

    res.status(200).json({
      success: true,
      data: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token" });
    }
    const tokens = await refreshTokenService(token);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  if (req.user) {
    await logoutUser(req.user.id);
  }
  res
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .status(200)
    .json({ success: true, message: "Logged out" });
};

export const verifyEmailHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      throw new AppError("Token is required", 400);
    }
    await verifyEmail(token);
    res.status(200).json({ success: true, message: "Email verified" });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    await forgotPassword(email);
    res
      .status(200)
      .json({ success: true, message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    next(error);
  }
};

export const resetPasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await resetPassword(token, password);
    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

export const googleLoginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    const client = new OAuth2Client(env.google.clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.google.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      throw new AppError("Invalid Google token", 401);
    }
    const { user, accessToken, refreshToken } = await googleLogin(
      payload.sub,
      payload.email,
      payload.name || "User",
      payload.picture
    );
    setAuthCookies(res, accessToken, refreshToken);
    res.status(200).json({
      success: true,
      data: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) throw new AppError("User not found", 404);
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      env.jwt.accessSecret,
      { expiresIn: env.jwt.accessExpires } as jwt.SignOptions
    );
    res
      .cookie("accessToken", accessToken, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({ success: true, data: user, accessToken });
  } catch (error) {
    next(error);
  }
};
