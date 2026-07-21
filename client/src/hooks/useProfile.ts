import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "@/services/profile.service";
import { useToastStore } from "@/store/toastStore";
import type { UpdateProfileInput } from "@/types/profile";
import type { AxiosError } from "axios";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.get(),
  });
}

export function useProfileMutation() {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => profileService.update(input),
    onSuccess: (res) => {
      queryClient.setQueryData(["profile"], res);
      toast("success", "Profile saved successfully");
    },
    onError: (err: AxiosError<{ message: string }>) => {
      toast("error", err.response?.data?.message || "Failed to update profile");
    },
  });
}
