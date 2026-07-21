import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
  user: Types.ObjectId;
  type: "new_message" | "new_application" | "status_update" | "interview_scheduled" | "interview_cancelled" | "interview_confirmed" | "interview_updated";
  message: string;
  isRead: boolean;
  metadata: {
    conversationId?: string;
    jobId?: string;
    jobTitle?: string;
    fromName?: string;
    fromId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["new_message", "new_application", "status_update", "interview_scheduled", "interview_cancelled", "interview_confirmed", "interview_updated"], required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });

export const Notification = model<INotification>("Notification", notificationSchema);
