import { api } from "./api";
import type { Job, JobFormData, JobFilters, Pagination } from "@/types/job";

interface JobsResponse {
  success: boolean;
  data: Job[];
  pagination: Pagination;
}

interface JobResponse {
  success: boolean;
  data: Job;
}

export const jobService = {
  list: async (filters: JobFilters = {}): Promise<JobsResponse> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    });
    const { data } = await api.get(`/jobs?${params.toString()}`);
    return data;
  },

  getById: async (id: string): Promise<JobResponse> => {
    const { data } = await api.get(`/jobs/${id}`);
    return data;
  },

  getMyJobs: async (): Promise<{ success: boolean; data: Job[] }> => {
    const { data } = await api.get("/jobs/me");
    return data;
  },

  create: async (input: JobFormData): Promise<JobResponse> => {
    const payload = {
      ...input,
      requiredSkills: input.requiredSkills.split(",").map((s) => s.trim()),
    };
    const { data } = await api.post("/jobs", payload);
    return data;
  },

  update: async (id: string, input: Partial<JobFormData>): Promise<JobResponse> => {
    const payload = {
      ...input,
      requiredSkills: input.requiredSkills
        ? input.requiredSkills.split(",").map((s) => s.trim())
        : undefined,
    };
    const { data } = await api.patch(`/jobs/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
};
