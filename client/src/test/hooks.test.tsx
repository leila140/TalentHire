import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { TestWrapper } from "./test-utils";
import { useJobs, useMyJobs, useJobById } from "@/hooks/useJobs";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useMyApplications } from "@/hooks/useApplications";
import { useMyInterviews } from "@/hooks/useInterviews";
import { useCompanyList } from "@/hooks/useCompany";
import { useConversations, useMessages } from "@/hooks/useMessages";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadNotificationCount } from "@/hooks/useNotifications";
import { useAdminStats } from "@/hooks/useAdmin";
import { useCandidates } from "@/hooks/useCandidates";

vi.mock("@/services/job.service", () => ({
  jobService: {
    list: vi.fn().mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }),
    getById: vi.fn().mockResolvedValue({ success: true, data: { _id: "1", title: "Test Job" } }),
    getMyJobs: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

vi.mock("@/services/savedJob.service", () => ({
  savedJobService: {
    list: vi.fn().mockResolvedValue({ success: true, data: [] }),
    save: vi.fn().mockResolvedValue({ success: true, data: {} }),
    unsave: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@/services/application.service", () => ({
  applicationService: {
    getMyApplications: vi.fn().mockResolvedValue({ success: true, data: [] }),
    apply: vi.fn().mockResolvedValue({ success: true, data: {} }),
    withdraw: vi.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

vi.mock("@/services/interview.service", () => ({
  interviewService: {
    getMyInterviews: vi.fn().mockResolvedValue({ success: true, data: [] }),
    confirm: vi.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

vi.mock("@/services/company.service", () => ({
  companyService: {
    list: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getMyCompany: vi.fn().mockResolvedValue({ success: true, data: {} }),
  },
}));

vi.mock("@/services/message.service", () => ({
  messageService: {
    getConversations: vi.fn().mockResolvedValue({ success: true, data: [] }),
    getMessages: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

vi.mock("@/services/profile.service", () => ({
  profileService: {
    get: vi.fn().mockResolvedValue({ success: true, data: { _id: "1", fullName: "Test" } }),
  },
}));

vi.mock("@/services/notification.service", () => ({
  notificationService: {
    getUnreadCount: vi.fn().mockResolvedValue(3),
  },
}));

vi.mock("@/services/admin.service", () => ({
  adminService: {
    getStats: vi.fn().mockResolvedValue({ success: true, data: { totalUsers: 10 } }),
  },
}));

vi.mock("@/services/candidate.service", () => ({
  candidateService: {
    search: vi.fn().mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }),
  },
}));

vi.mock("@/store/toastStore", () => ({
  useToastStore: vi.fn(() => ({ addToast: vi.fn() })),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: vi.fn((selector: any) =>
    selector({ user: { id: "1", role: "candidate", fullName: "Test" }, isAuthenticated: true })
  ),
}));

const wrapper = TestWrapper;

describe("useJobs", () => {
  beforeEach(() => vi.clearAllMocks());

  it("fetches jobs with filters", async () => {
    const { result } = renderHook(() => useJobs({ page: 1 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
  });
});

describe("useMyJobs", () => {
  it("fetches recruiter jobs", async () => {
    const { result } = renderHook(() => useMyJobs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useJobById", () => {
  it("fetches a job by id", async () => {
    const { result } = renderHook(() => useJobById("1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.title).toBe("Test Job");
  });

  it("does not fetch when id is undefined", () => {
    const { result } = renderHook(() => useJobById(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useSavedJobs", () => {
  it("fetches saved jobs and returns savedIds", async () => {
    const { result } = renderHook(() => useSavedJobs(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.savedIds).toBeInstanceOf(Set);
  });
});

describe("useMyApplications", () => {
  it("fetches applications", async () => {
    const { result } = renderHook(() => useMyApplications(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useMyInterviews", () => {
  it("fetches interviews", async () => {
    const { result } = renderHook(() => useMyInterviews(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useCompanyList", () => {
  it("fetches companies", async () => {
    const { result } = renderHook(() => useCompanyList(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useConversations", () => {
  it("fetches conversations", async () => {
    const { result } = renderHook(() => useConversations(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useMessages", () => {
  it("fetches messages when conversationId is provided", async () => {
    const { result } = renderHook(() => useMessages("conv1"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("does not fetch without conversationId", () => {
    const { result } = renderHook(() => useMessages(undefined), { wrapper });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useProfile", () => {
  it("fetches profile", async () => {
    const { result } = renderHook(() => useProfile(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useUnreadNotificationCount", () => {
  it("fetches unread count", async () => {
    const { result } = renderHook(() => useUnreadNotificationCount(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(3);
  });
});

describe("useAdminStats", () => {
  it("fetches admin stats", async () => {
    const { result } = renderHook(() => useAdminStats(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useCandidates", () => {
  it("fetches candidates with filters", async () => {
    const { result } = renderHook(() => useCandidates({ search: "react" }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
