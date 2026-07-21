import { api } from "./api";
import type { CandidateSearchResult, CandidateFilters } from "@/types/candidate";

export type { CandidateSearchResult, CandidateFilters } from "@/types/candidate";

export const candidateService = {
  search: async (filters: CandidateFilters): Promise<{
    success: boolean;
    data: CandidateSearchResult[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> => {
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.skills) params.set("skills", filters.skills);
    if (filters.location) params.set("location", filters.location);
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    const { data } = await api.get(`/candidates?${params.toString()}`);
    return data;
  },
};
