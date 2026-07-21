export type UserRole = "candidate" | "recruiter" | "admin";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}
