export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export interface Experience {
  company: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
}

export type LanguageLevel = "beginner" | "intermediate" | "advanced" | "native";

export interface Language {
  language: string;
  level: LanguageLevel;
}

export interface Certificate {
  name: string;
  issuer: string;
  url?: string;
}

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  languages: Language[];
  certificates: Certificate[];
  portfolio?: string;
  github?: string;
  linkedin?: string;
  resumeUrl?: string;
}

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  location?: string;
  title?: string;
  bio?: string;
  skills?: string[];
  education?: Education[];
  experience?: Experience[];
  languages?: Language[];
  certificates?: Certificate[];
  portfolio?: string;
  github?: string;
  linkedin?: string;
}
