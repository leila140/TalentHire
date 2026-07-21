import { Schema, model, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
  user: Types.ObjectId;
  action: string;
  entity: string;
  entityId?: Types.ObjectId;
  metadata?: Record<string, any>;
  ip?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
  },
  { timestamps: true }
);

activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ entity: 1, entityId: 1 });

export const ActivityLog = model<IActivityLog>("ActivityLog", activityLogSchema);
