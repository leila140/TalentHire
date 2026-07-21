import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { useToastStore } from "@/store/toastStore";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getStats(),
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminService.getAnalytics(),
  });
}

export function useAdminUsers(filters?: { role?: string; search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-users", filters],
    queryFn: () => adminService.getUsers(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminCompanies(filters?: { isApproved?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-companies", filters],
    queryFn: () => adminService.getCompanies(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminJobs(filters?: { search?: string; isActive?: string; employmentType?: string; workMode?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-jobs", filters],
    queryFn: () => adminService.getJobs(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminApplications(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-applications", filters],
    queryFn: () => adminService.getApplications(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminReports(filters?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-reports", filters],
    queryFn: () => adminService.getReports(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminActivityLogs(filters?: { entity?: string; action?: string; userId?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin-activity", filters],
    queryFn: () => adminService.getActivityLogs(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUserMutations() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const updateRole = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => adminService.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast("success", "User role updated");
    },
  });

  const deleteUser = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast("success", "User deleted");
    },
  });

  return { updateRole, deleteUser };
}

export function useAdminCompanyMutations() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const approveCompany = useMutation({
    mutationFn: (companyId: string) => adminService.approveCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast("success", "Company approved");
    },
  });

  const deleteCompany = useMutation({
    mutationFn: (companyId: string) => adminService.deleteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast("success", "Company deleted");
    },
  });

  return { approveCompany, deleteCompany };
}

export function useAdminJobMutations() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const deleteJob = useMutation({
    mutationFn: (jobId: string) => adminService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast("success", "Job deleted");
    },
  });

  return { deleteJob };
}

export function useAdminReportMutations() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const generateReport = useMutation({
    mutationFn: ({ type, title }: { type: string; title?: string }) => adminService.generateReport(type, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast("success", "Report generated");
    },
  });

  const deleteReport = useMutation({
    mutationFn: (reportId: string) => adminService.deleteReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      toast("success", "Report deleted");
    },
  });

  return { generateReport, deleteReport };
}
