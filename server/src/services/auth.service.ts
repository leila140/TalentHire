import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "@models/User";
import { Company } from "@models/Company";
import { env } from "@config/env";
import { AppError } from "@middlewares/errorHandler";
import { RegisterInput, LoginInput } from "@validators/auth.validator";
import { sendVerificationEmail, sendResetPasswordEmail, sendWelcomeEmail } from "@config/email";

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign({ id: userId, role }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpires,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign({ id: userId, role }, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpires,
  } as jwt.SignOptions);

  return { accessToken, refreshToken };
};

export const registerUser = async (input: RegisterInput) => {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationTokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");

  const user = await User.create({
    fullName: input.fullName,
    email: input.email,
    password: hashedPassword,
    role: input.role,
    verificationToken: verificationTokenHash,
  });

  if (input.role === "recruiter" && input.company) {
    const company = await Company.create({
      name: input.company.name,
      description: input.company.description,
      industry: input.company.industry,
      employees: input.company.employees,
      location: input.company.location,
      website: input.company.website || "",
      createdBy: user.id,
    });
    user.company = company.id;
    await user.save();
  }

  const tokens = generateTokens(user.id, user.role);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  await sendVerificationEmail(input.email, verificationToken);

  return { user, ...tokens };
};

export const loginUser = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user || !user.password) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const tokens = generateTokens(user.id, user.role);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, ...tokens };
};

export const refreshTokenService = async (token: string) => {
  try {
    const decoded = jwt.verify(token, env.jwt.refreshSecret) as { id: string; role: string };
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== token) {
      throw new AppError("Invalid refresh token", 401);
    }

    const tokens = generateTokens(user.id, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
};

export const logoutUser = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const verifyEmail = async (token: string) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const targetUser = await User.findOne({ verificationToken: tokenHash }).select("+verificationToken");
  if (!targetUser) throw new AppError("Invalid token", 400);

  targetUser.isEmailVerified = true;
  targetUser.verificationToken = undefined;
  await targetUser.save();

  sendWelcomeEmail(targetUser.email, targetUser.fullName);

  return targetUser;
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email });
  if (!user) return;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

  user.resetPasswordToken = resetTokenHash;
  user.resetPasswordExpires = new Date(Date.now() + 3600000);
  await user.save();

  await sendResetPasswordEmail(email, resetToken);
};

export const resetPassword = async (token: string, password: string) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const targetUser = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+resetPasswordToken");

  if (!targetUser) throw new AppError("Invalid or expired reset token", 400);

  targetUser.password = await bcrypt.hash(password, 10);
  targetUser.resetPasswordToken = undefined;
  targetUser.resetPasswordExpires = undefined;
  await targetUser.save();
};

export const googleLogin = async (
  googleId: string,
  email: string,
  fullName: string,
  avatarUrl?: string
) => {
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      fullName,
      email,
      googleId,
      avatarUrl,
      isEmailVerified: true,
      role: "candidate",
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isEmailVerified = true;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    await user.save();
  }

  const tokens = generateTokens(user.id, user.role);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user, ...tokens };
};
