export interface ResumeAnalysis {
  _id: string;
  candidate: string;
  resumeUrl: string;
  extractedText: string;
  overallScore: number;
  missingSkills: string[];
  strongSkills: string[];
  weakPoints: string[];
  suggestions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MatchResult {
  overallScore: number;
  missingSkills: string[];
  strongSkills: string[];
  weakPoints: string[];
  suggestions: string[];
}
