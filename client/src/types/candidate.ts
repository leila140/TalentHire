export interface CandidateSearchResult {
  _id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  title?: string;
  skills: string[];
  location?: string;
  experience: { company: string; title: string; current: boolean }[];
  education: { institution: string; degree: string; field: string }[];
  bio?: string;
}

export interface CandidateFilters {
  search?: string;
  skills?: string;
  location?: string;
  page?: number;
  limit?: number;
}
