export type EmploymentType = "full-time" | "part-time" | "contract" | "internship";
export type WorkMode = "remote" | "hybrid" | "on-site";

export interface Job {
  _id: string;
  title: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  requiredSkills: string[];
  experienceMin: number;
  experienceMax: number;
  deadline: string;
  isActive: boolean;
  company: { _id: string; name: string; logo?: string; location?: string };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobFormData {
  title: string;
  description: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  location: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  requiredSkills: string;
  experienceMin: number;
  experienceMax: number;
  deadline: string;
}

export interface JobFilters {
  search?: string;
  location?: string;
  employmentType?: EmploymentType;
  workMode?: WorkMode;
  skills?: string;
  minSalary?: number;
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
