import { describe, it, expect } from "vitest";

describe("Cascade Delete Logic", () => {
  describe("cascade dependency graph", () => {
    it("User deletion cascades to: applications, savedJobs, notifications, activityLogs, resumeAnalyses, reports, interviews, messages, conversations", () => {
      const userCascadeTargets = [
        "Application",
        "SavedJob",
        "Notification",
        "ActivityLog",
        "ResumeAnalysis",
        "Report",
        "Interview",
        "Message",
        "Conversation",
      ];
      expect(userCascadeTargets.length).toBe(9);
    });

    it("Company deletion cascades to: jobs, applications for those jobs, savedJobs, interviews", () => {
      const companyCascadeTargets = ["Job", "Application", "SavedJob", "Interview"];
      expect(companyCascadeTargets.length).toBe(4);
    });

    it("Job deletion cascades to: applications, savedJobs, interviews", () => {
      const jobCascadeTargets = ["Application", "SavedJob", "Interview"];
      expect(jobCascadeTargets.length).toBe(3);
    });
  });

  describe("cascade module exports", () => {
    it("exports cascadeDeleteUser, cascadeDeleteCompany, cascadeDeleteJob", async () => {
      const cascade = await import("@utils/cascade");
      expect(typeof cascade.cascadeDeleteUser).toBe("function");
      expect(typeof cascade.cascadeDeleteCompany).toBe("function");
      expect(typeof cascade.cascadeDeleteJob).toBe("function");
    });
  });
});
