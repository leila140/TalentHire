import { api } from "./api";
import type {
  AdminStats,
  AdminUser,
  AdminCompany,
  AdminJob,
  AdminApplication,
  AdminReport,
  AdminActivityLog,
} from "@/types/admin";

export type {
  AdminStats,
  AdminUser,
  AdminCompany,
  AdminJob,
  AdminApplication,
  AdminReport,
  AdminActivityLog,
} from "@/types/admin";

export const adminService = {
  getStats: async (): Promise<{ success: boolean; data: AdminStats }> => {
    const { data } = await api.get("/admin/stats");
    return data;
  },
  getAnalytics: async (): Promise<{
    success: boolean;
    data: {
      userGrowth: { name: string; users: number }[];
      applicationBreakdown: { name: string; value: number }[];
      jobTypeBreakdown: { name: string; value: number }[];
      workModeBreakdown: { name: string; value: number }[];
      companyApprovalData: { name: string; value: number }[];
      activityTimeline: { date: string; actions: number }[];
    };
  }> => {
    const { data } = await api.get("/admin/analytics");
    return data;
  },
  getUsers: async (filters?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminUser[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams();
    if (filters?.role) params.set("role", filters.role);
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const { data } = await api.get(`/admin/users?${params.toString()}`);
    return data;
  },
  updateUserRole: async (userId: string, role: string): Promise<{ success: boolean; data: AdminUser }> => {
    const { data } = await api.patch(`/admin/users/${userId}/role`, { role });
    return data;
  },
  deleteUser: async (userId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/admin/users/${userId}`);
    return data;
  },
  getCompanies: async (filters?: {
    isApproved?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminCompany[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams();
    if (filters?.isApproved) params.set("isApproved", filters.isApproved);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const { data } = await api.get(`/admin/companies?${params.toString()}`);
    return data;
  },
  approveCompany: async (companyId: string): Promise<{ success: boolean; data: AdminCompany }> => {
    const { data } = await api.patch(`/admin/companies/${companyId}/approve`);
    return data;
  },
  deleteCompany: async (companyId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/admin/companies/${companyId}`);
    return data;
  },
  getJobs: async (filters?: {
    search?: string;
    isActive?: string;
    employmentType?: string;
    workMode?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminJob[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.isActive) params.set("isActive", filters.isActive);
    if (filters?.employmentType) params.set("employmentType", filters.employmentType);
    if (filters?.workMode) params.set("workMode", filters.workMode);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const { data } = await api.get(`/admin/jobs?${params.toString()}`);
    return data;
  },
  deleteJob: async (jobId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/admin/jobs/${jobId}`);
    return data;
  },
  getApplications: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminApplication[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const { data } = await api.get(`/admin/applications?${params.toString()}`);
    return data;
  },
  getReports: async (filters?: {
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminReport[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams();
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const { data } = await api.get(`/reports?${params.toString()}`);
    return data;
  },
  generateReport: async (type: string, title?: string): Promise<{ success: boolean; data: AdminReport }> => {
    const { data } = await api.post("/reports", { type, title });
    return data;
  },
  deleteReport: async (reportId: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/reports/${reportId}`);
    return data;
  },
  getActivityLogs: async (filters?: {
    entity?: string;
    action?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: AdminActivityLog[]; pagination: { page: number; limit: number; total: number; pages: number } }> => {
    const params = new URLSearchParams();
    if (filters?.entity) params.set("entity", filters.entity);
    if (filters?.action) params.set("action", filters.action);
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const { data } = await api.get(`/activity?${params.toString()}`);
    return data;
  },
};
