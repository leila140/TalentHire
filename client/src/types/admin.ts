export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalCompanies: number;
  usersByRole: Record<string, number>;
  recentUsers: { _id: string; fullName: string; email: string; role: string; createdAt: string }[];
}

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AdminCompany {
  _id: string;
  name: string;
  description: string;
  industry: string;
  location: string;
  isApproved: boolean;
  createdBy: { _id: string; fullName: string; email: string };
  createdAt: string;
}

export interface AdminJob {
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
  company: { _id: string; name: string; logo?: string; location: string };
  createdBy: { _id: string; fullName: string; email: string };
  createdAt: string;
}

export interface AdminApplication {
  _id: string;
  candidate: { _id: string; fullName: string; email: string; avatarUrl?: string };
  job: { _id: string; title: string; company?: { name: string } };
  status: string;
  coverLetter?: string;
  aiScore?: number;
  createdAt: string;
}

export interface AdminReport {
  _id: string;
  type: string;
  title: string;
  data: Record<string, unknown>;
  generatedBy: { _id: string; fullName: string; email: string };
  createdAt: string;
}

export interface AdminActivityLog {
  _id: string;
  user: { _id: string; fullName: string; email: string; role: string } | string;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  createdAt: string;
}
