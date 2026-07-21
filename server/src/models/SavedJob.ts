import { Schema, model, Document, Types } from "mongoose";

export interface ISavedJob extends Document {
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  createdAt: Date;
}

const savedJobSchema = new Schema<ISavedJob>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
  },
  { timestamps: true }
);

savedJobSchema.index({ candidate: 1, job: 1 }, { unique: true });

export const SavedJob = model<ISavedJob>("SavedJob", savedJobSchema);
