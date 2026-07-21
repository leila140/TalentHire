export type InterviewStatus = "scheduled" | "completed" | "cancelled";

export interface Interview {
  _id: string;
  application: { _id: string; status: string; job?: { _id: string; title: string; company?: { _id: string; name: string; logo?: string } } };
  recruiter: { _id: string; fullName: string };
  candidate: { _id: string; fullName: string; email: string; avatarUrl?: string };
  scheduledAt: string;
  duration: number;
  meetingLink?: string;
  notes?: string;
  status: InterviewStatus;
  aiQuestions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleInterviewInput {
  applicationId: string;
  scheduledAt: string;
  duration: number;
  meetingLink?: string;
  notes?: string;
  aiQuestions?: string[];
}
