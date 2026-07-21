import { Schema, model, Document, Types } from "mongoose";

export type EmploymentType = "full-time" | "part-time" | "contract" | "internship";
export type WorkMode = "remote" | "hybrid" | "on-site";

export interface IJob extends Document {
  title: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  requiredSkills: string[];
  experienceMin: number;
  experienceMax: number;
  deadline: Date;
  isActive: boolean;
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    currency: { type: String, default: "USD" },
    location: { type: String, required: true },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: true,
    },
    workMode: {
      type: String,
      enum: ["remote", "hybrid", "on-site"],
      required: true,
    },
    requiredSkills: [{ type: String }],
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 10 },
    deadline: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", description: "text" });
jobSchema.index({ requiredSkills: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ isActive: 1, deadline: 1 });

export const Job = model<IJob>("Job", jobSchema);
