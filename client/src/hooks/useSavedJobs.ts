import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { savedJobService } from "@/services/savedJob.service";
import { useToastStore } from "@/store/toastStore";
import type { AxiosError } from "axios";

export function useSavedJobs() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const query = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => savedJobService.list(),
  });

  const saveMutation = useMutation({
    mutationFn: (jobId: string) => savedJobService.save(jobId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-jobs"] }),
    onError: (err: AxiosError<{ message: string }>) => toast("error", err.response?.data?.message || "Failed to save job"),
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId: string) => savedJobService.unsave(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-jobs"] });
      toast("success", "Job removed from saved");
    },
    onError: (err: AxiosError<{ message: string }>) => toast("error", err.response?.data?.message || "Failed to unsave job"),
  });

  const savedIds = new Set(
    query.data?.data?.map((s) => (typeof s.job === "string" ? s.job : s.job._id)) || []
  );

  return {
    ...query,
    savedIds,
    saveMutation,
    unsaveMutation,
  };
}
