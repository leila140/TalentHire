import { Schema, model, Document, Types } from "mongoose";

export interface IInterview extends Document {
  application: Types.ObjectId;
  recruiter: Types.ObjectId;
  candidate: Types.ObjectId;
  scheduledAt: Date;
  duration: number;
  meetingLink?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  aiQuestions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const interviewSchema = new Schema<IInterview>(
  {
    application: { type: Schema.Types.ObjectId, ref: "Application", required: true },
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    meetingLink: { type: String },
    notes: { type: String },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    aiQuestions: [{ type: String }],
  },
  { timestamps: true }
);

export const Interview = model<IInterview>("Interview", interviewSchema);
