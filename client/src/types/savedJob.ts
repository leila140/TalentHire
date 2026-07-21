import type { Job } from "./job";

export interface SavedJob {
  _id: string;
  candidate: string;
  job: Job;
  createdAt: string;
}
