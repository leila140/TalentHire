import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService } from "@/services/application.service";
import { useToastStore } from "@/store/toastStore";
import type { AxiosError } from "axios";

export function useMyApplications() {
  return useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationService.getMyApplications(),
  });
}

export function useJobApplicants(jobId: string | undefined) {
  return useQuery({
    queryKey: ["job-applicants", jobId],
    queryFn: () => applicationService.getJobApplicants(jobId!),
    enabled: !!jobId,
  });
}

export function useWithdrawApplication() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (appId: string) => applicationService.withdraw(appId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast("success", "Application withdrawn successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast("error", err.response?.data?.message || "Failed to withdraw application");
    },
  });
}

export function useUpdateApplicationStatus() {
  const toast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ appId, status, reason }: { appId: string; status: string; reason?: string }) =>
      applicationService.updateStatus(appId, status, reason),
    onSuccess: () => {
      toast("success", "Status updated");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast("error", err.response?.data?.message || "Failed to update status");
    },
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ jobId, coverLetter }: { jobId: string; coverLetter?: string }) =>
      applicationService.apply(jobId, coverLetter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      toast("success", "Application submitted successfully!");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast("error", err.response?.data?.message || "Failed to apply");
    },
  });
}
