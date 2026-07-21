import { useQuery } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";
import type { JobFilters } from "@/types/job";

export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobService.list(filters),
  });
}

export function useJobById(id: string | undefined) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => jobService.getById(id!),
    enabled: !!id,
  });
}

export function useMyJobs() {
  return useQuery({
    queryKey: ["myJobs"],
    queryFn: () => jobService.getMyJobs(),
  });
}
