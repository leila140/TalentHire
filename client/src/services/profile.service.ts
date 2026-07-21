import { api } from "./api";
import type { UserProfile, UpdateProfileInput } from "@/types/profile";

export type { Education, Experience, Language, Certificate, UserProfile, UpdateProfileInput } from "@/types/profile";

export const profileService = {
  get: async (): Promise<{ success: boolean; data: UserProfile }> => {
    const { data } = await api.get("/profile");
    return data;
  },
  update: async (input: UpdateProfileInput): Promise<{ success: boolean; data: UserProfile }> => {
    const { data } = await api.patch("/profile", input);
    return data;
  },
  uploadAvatar: async (file: File): Promise<{ success: boolean; data: { avatarUrl: string } }> => {
    const form = new FormData();
    form.append("avatar", file);
    const { data } = await api.post("/upload/avatar", form);
    return data;
  },
  uploadResume: async (file: File): Promise<{ success: boolean; data: { resumeUrl: string } }> => {
    const form = new FormData();
    form.append("resume", file);
    const { data } = await api.post("/upload/resume", form);
    return data;
  },
};
