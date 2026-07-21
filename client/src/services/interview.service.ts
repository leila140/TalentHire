import { api } from "./api";
import type { Interview, ScheduleInterviewInput } from "@/types/interview";

export const interviewService = {
  schedule: async (data: ScheduleInterviewInput): Promise<{ success: boolean; data: Interview }> => {
    const { data: res } = await api.post("/interviews", data);
    return res;
  },
  getJobInterviews: async (jobId: string): Promise<{ success: boolean; data: Interview[] }> => {
    const { data } = await api.get(`/interviews/job/${jobId}`);
    return data;
  },
  getMyInterviews: async (): Promise<{ success: boolean; data: Interview[] }> => {
    const { data } = await api.get("/interviews/me");
    return data;
  },
  getById: async (id: string): Promise<{ success: boolean; data: Interview }> => {
    const { data } = await api.get(`/interviews/${id}`);
    return data;
  },
  update: async (id: string, updates: Partial<ScheduleInterviewInput>): Promise<{ success: boolean; data: Interview }> => {
    const { data } = await api.patch(`/interviews/${id}`, updates);
    return data;
  },
  cancel: async (id: string): Promise<{ success: boolean; data: Interview }> => {
    const { data } = await api.patch(`/interviews/${id}/cancel`);
    return data;
  },
  confirm: async (id: string): Promise<{ success: boolean; data: Interview }> => {
    const { data } = await api.patch(`/interviews/${id}/confirm`);
    return data;
  },
  complete: async (id: string): Promise<{ success: boolean; data: Interview }> => {
    const { data } = await api.patch(`/interviews/${id}/complete`);
    return data;
  },
};
