export interface Company {
  _id: string;
  name: string;
  logo?: string;
  description: string;
  industry: string;
  employees: number;
  location: string;
  website?: string;
  benefits: string[];
  gallery: { _id: string; url: string; caption?: string }[];
  isApproved: boolean;
  createdBy: { _id: string; fullName: string; avatarUrl?: string };
  activeJobCount?: number;
  createdAt: string;
}

export interface CreateCompanyInput {
  name: string;
  description: string;
  industry: string;
  employees: number;
  location: string;
  website?: string;
  benefits?: string[];
}

export interface CompanyJob {
  _id: string;
  title: string;
  description: string;
  location: string;
  employmentType: string;
  workMode: string;
  requiredSkills: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  experienceMin: number;
  experienceMax: number;
  deadline: string;
  isActive: boolean;
  createdAt: string;
}
