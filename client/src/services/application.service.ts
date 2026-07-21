import { api } from "./api";
import type { Application } from "@/types/application";

export type { Application, CandidateInfo, PopulatedCompany, PopulatedJob } from "@/types/application";

export const applicationService = {
  apply: async (jobId: string, coverLetter?: string): Promise<{ success: boolean; data: Application }> => {
    const { data } = await api.post("/applications", { jobId, coverLetter });
    return data;
  },
  getMyApplications: async (): Promise<{ success: boolean; data: Application[] }> => {
    const { data } = await api.get("/applications/me");
    return data;
  },
  getJobApplicants: async (jobId: string): Promise<{ success: boolean; data: Application[] }> => {
    const { data } = await api.get(`/applications/job/${jobId}`);
    return data;
  },
  updateStatus: async (applicationId: string, status: string, reason?: string): Promise<{ success: boolean; data: Application }> => {
    const { data } = await api.patch(`/applications/${applicationId}/status`, { status, reason });
    return data;
  },
  withdraw: async (applicationId: string): Promise<{ success: boolean; data: Application }> => {
    const { data } = await api.patch(`/applications/${applicationId}/withdraw`);
    return data;
  },
};
