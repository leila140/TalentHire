import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { interviewService } from "@/services/interview.service";
import { useToastStore } from "@/store/toastStore";
import type { ScheduleInterviewInput } from "@/types/interview";

export function useMyInterviews() {
  return useQuery({
    queryKey: ["my-interviews"],
    queryFn: () => interviewService.getMyInterviews(),
  });
}

export function useRecruiterInterviews(selectedJob: string, jobIds: string[]) {
  return useQuery({
    queryKey: ["recruiter-interviews", selectedJob],
    queryFn: async () => {
      const results = await Promise.all(
        jobIds.map((id) => interviewService.getJobInterviews(id))
      );
      return results.flatMap((r) => r.data);
    },
    enabled: jobIds.length > 0,
  });
}

export function useInterviewMutations() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const confirmMutation = useMutation({
    mutationFn: (id: string) => interviewService.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
      toast("success", "Attendance confirmed");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => interviewService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
      toast("success", "Interview cancelled");
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => interviewService.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
      toast("success", "Interview marked as completed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleInterviewInput> }) => interviewService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
      toast("success", "Interview updated");
    },
  });

  const scheduleMutation = useMutation({
    mutationFn: (data: ScheduleInterviewInput) => interviewService.schedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-interviews"] });
      queryClient.invalidateQueries({ queryKey: ["recruiter-interviews"] });
      toast("success", "Interview scheduled");
    },
  });

  return { confirmMutation, cancelMutation, completeMutation, updateMutation, scheduleMutation };
}
