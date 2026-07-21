export type NotificationType =
  | "new_message"
  | "new_application"
  | "status_update"
  | "interview_scheduled"
  | "interview_cancelled"
  | "interview_confirmed"
  | "interview_updated";

export interface AppNotification {
  _id: string;
  user: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  metadata: {
    conversationId?: string;
    jobId?: string;
    jobTitle?: string;
    fromName?: string;
    fromId?: string;
  };
  createdAt: string;
}
