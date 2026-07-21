import { api } from "./api";
import type { Company, CreateCompanyInput, CompanyJob } from "@/types/company";

export type { Company, CreateCompanyInput, CompanyJob } from "@/types/company";

export const companyService = {
  getMyCompany: async (): Promise<{ success: boolean; data: Company }> => {
    const { data } = await api.get("/companies/me");
    return data;
  },

  getById: async (id: string): Promise<{ success: boolean; data: Company }> => {
    const { data } = await api.get(`/companies/${id}`);
    return data;
  },

  list: async (): Promise<{ success: boolean; data: Company[] }> => {
    const { data } = await api.get("/companies");
    return data;
  },

  getCompanyJobs: async (
    companyId: string,
    page?: number,
    limit?: number
  ): Promise<{
    success: boolean;
    data: CompanyJob[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> => {
    const params = new URLSearchParams();
    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    const { data } = await api.get(`/companies/${companyId}/jobs?${params.toString()}`);
    return data;
  },

  create: async (input: CreateCompanyInput): Promise<{ success: boolean; data: Company }> => {
    const { data } = await api.post("/companies", input);
    return data;
  },

  update: async (id: string, input: Partial<CreateCompanyInput>): Promise<{ success: boolean; data: Company }> => {
    const { data } = await api.patch(`/companies/${id}`, input);
    return data;
  },
};
