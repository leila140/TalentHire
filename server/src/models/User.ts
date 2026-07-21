import { Schema, model, Document, Types } from "mongoose";

export type UserRole = "candidate" | "recruiter" | "admin";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  role: UserRole;
  isEmailVerified: boolean;
  googleId?: string;
  avatarUrl?: string;
  company?: Types.ObjectId;
  refreshToken?: string;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  skills: string[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }[];
  experience: {
    company: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }[];
  languages: { language: string; level: "beginner" | "intermediate" | "advanced" | "native" }[];
  portfolio?: string;
  github?: string;
  linkedin?: string;
  resumeUrl?: string;
  certificates: { name: string; issuer: string; url?: string }[];
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      default: "candidate",
    },
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String },
    avatarUrl: { type: String },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    refreshToken: { type: String, select: false },
    verificationToken: { type: String, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date },
    skills: [{ type: String }],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
      },
    ],
    experience: [
      {
        company: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
      },
    ],
    languages: [
      {
        language: { type: String, required: true },
        level: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "native"],
        },
      },
    ],
    portfolio: { type: String },
    github: { type: String },
    linkedin: { type: String },
    resumeUrl: { type: String },
    certificates: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        url: { type: String },
      },
    ],
    phone: { type: String },
    location: { type: String },
    title: { type: String },
    bio: { type: String },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
