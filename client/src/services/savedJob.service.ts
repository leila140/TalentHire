import { api } from "./api";
import type { SavedJob } from "@/types/savedJob";

export type { SavedJob } from "@/types/savedJob";

export const savedJobService = {
  list: async (): Promise<{ success: boolean; data: SavedJob[] }> => {
    const { data } = await api.get("/saved-jobs");
    return data;
  },
  save: async (jobId: string): Promise<{ success: boolean; data: SavedJob }> => {
    const { data } = await api.post("/saved-jobs", { jobId });
    return data;
  },
  unsave: async (jobId: string): Promise<void> => {
    await api.delete(`/saved-jobs/${jobId}`);
  },
};
