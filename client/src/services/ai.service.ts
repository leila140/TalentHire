import { api } from "./api";
import type { ResumeAnalysis, MatchResult } from "@/types/ai";

export const aiService = {
  analyzeResume: async (resumeUrl: string): Promise<{ success: boolean; data: ResumeAnalysis }> => {
    const { data } = await api.post("/ai/analyze-resume", { resumeUrl });
    return data;
  },

  matchCandidate: async (applicationId: string): Promise<{ success: boolean; data: MatchResult }> => {
    const { data } = await api.get(`/ai/match/${applicationId}`);
    return data;
  },

  getQuestions: async (applicationId: string): Promise<{ success: boolean; data: { question: string; category: string; difficulty: string; reason: string }[] }> => {
    const { data } = await api.get(`/ai/questions/${applicationId}`);
    return data;
  },

  generateCoverLetter: async (jobId: string): Promise<{ success: boolean; data: string }> => {
    const { data } = await api.post("/ai/cover-letter", { jobId });
    return data;
  },
};
