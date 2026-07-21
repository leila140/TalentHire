import { Schema, model, Document, Types } from "mongoose";

export type ApplicationStatus =
  | "applied"
  | "under-review"
  | "interview"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface IApplication extends Document {
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  status: ApplicationStatus;
  resumeUrl?: string;
  coverLetter?: string;
  notes?: string;
  rejectionReason?: string;
  aiScore?: number;
  aiFeedback?: {
    overallScore: number;
    missingSkills: string[];
    strongSkills: string[];
    weakPoints: string[];
    suggestions: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    status: {
      type: String,
      enum: ["applied", "under-review", "interview", "accepted", "rejected", "withdrawn"],
      default: "applied",
    },
    resumeUrl: { type: String },
    coverLetter: { type: String },
    notes: { type: String },
    rejectionReason: { type: String },
    aiScore: { type: Number },
    aiFeedback: {
      overallScore: { type: Number },
      missingSkills: [{ type: String }],
      strongSkills: [{ type: String }],
      weakPoints: [{ type: String }],
      suggestions: [{ type: String }],
    },
  },
  { timestamps: true }
);

applicationSchema.index({ candidate: 1, job: 1 }, { unique: true });

export const Application = model<IApplication>("Application", applicationSchema);
