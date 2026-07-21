import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/company.service";
import { useToastStore } from "@/store/toastStore";
import type { CreateCompanyInput } from "@/types/company";
import type { AxiosError } from "axios";

export function useMyCompany() {
  return useQuery({
    queryKey: ["my-company"],
    queryFn: () => companyService.getMyCompany(),
  });
}

export function useCompanyById(id: string | undefined) {
  return useQuery({
    queryKey: ["company", id],
    queryFn: () => companyService.getById(id!),
    enabled: !!id,
  });
}

export function useCompanyList() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => companyService.list(),
  });
}

export function useCompanyJobs(companyId: string | undefined, page?: number, limit?: number) {
  return useQuery({
    queryKey: ["company-jobs", companyId],
    queryFn: () => companyService.getCompanyJobs(companyId!, page, limit),
    enabled: !!companyId,
  });
}

export function useCompanyMutations() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const createMutation = useMutation({
    mutationFn: (input: CreateCompanyInput) => companyService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast("success", "Company created successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast("error", err.response?.data?.message || "Failed to create company");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateCompanyInput> }) => companyService.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-company"] });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast("success", "Company updated successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast("error", err.response?.data?.message || "Failed to update company");
    },
  });

  return { createMutation, updateMutation };
}
