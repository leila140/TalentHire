import { Schema, model, Document, Types } from "mongoose";

export interface IReport extends Document {
  type: "user_stats" | "job_stats" | "application_stats" | "company_stats" | "custom";
  title: string;
  data: Record<string, any>;
  generatedBy: Types.ObjectId;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    type: { type: String, enum: ["user_stats", "job_stats", "application_stats", "company_stats", "custom"], required: true },
    title: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

reportSchema.index({ type: 1, createdAt: -1 });

export const Report = model<IReport>("Report", reportSchema);
