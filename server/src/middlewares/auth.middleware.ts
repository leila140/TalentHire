import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@config/env";
import { AppError } from "./errorHandler";
import { UserRole } from "@models/User";

export interface AuthPayload {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError("Authentication token missing", 401);
    }

    const decoded = jwt.verify(token, env.jwt.accessSecret) as AuthPayload;
    req.user = decoded;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Access forbidden: insufficient role", 403));
    }
    next();
  };
};
