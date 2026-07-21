import { Schema, model, Document, Types } from "mongoose";

export interface IResumeAnalysis extends Document {
  candidate: Types.ObjectId;
  resumeUrl: string;
  extractedText: string;
  overallScore: number;
  missingSkills: string[];
  strongSkills: string[];
  weakPoints: string[];
  suggestions: string[];
  createdAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeUrl: { type: String, required: true },
    extractedText: { type: String },
    overallScore: { type: Number },
    missingSkills: [{ type: String }],
    strongSkills: [{ type: String }],
    weakPoints: [{ type: String }],
    suggestions: [{ type: String }],
  },
  { timestamps: true }
);

export const ResumeAnalysis = model<IResumeAnalysis>("ResumeAnalysis", resumeAnalysisSchema);
