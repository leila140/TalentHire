export interface CandidateInfo {
  _id: string;
  fullName: string;
  email: string;
  resumeUrl?: string;
  avatarUrl?: string;
  skills?: string[];
}

export interface PopulatedCompany {
  _id: string;
  name: string;
  logo?: string;
  location?: string;
}

export interface PopulatedJob {
  _id: string;
  title: string;
  location: string;
  employmentType: string;
  company: PopulatedCompany;
}

export interface Application {
  _id: string;
  candidate: string | CandidateInfo;
  job: string | PopulatedJob;
  coverLetter?: string;
  rejectionReason?: string;
  status: string;
  aiScore?: number;
  aiFeedback?: {
    overallScore: number;
    missingSkills: string[];
    strongSkills: string[];
    weakPoints: string[];
    suggestions: string[];
  };
  createdAt: string;
  updatedAt: string;
}
