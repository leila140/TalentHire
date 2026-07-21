import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AdminDashboardPage } from "@/pages/AdminDashboardPage";
import { CompanyListPage } from "@/pages/CompanyListPage";
import { SavedJobsPage } from "@/pages/SavedJobsPage";
import { MyApplicationsPage } from "@/pages/MyApplicationsPage";
import { MyInterviewsPage } from "@/pages/MyInterviewsPage";
import { ConversationsPage } from "@/pages/ConversationsPage";
import { CandidatesPage } from "@/pages/CandidatesPage";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock("@/services/admin.service", () => ({
  adminService: {
    getStats: vi.fn().mockResolvedValue({
      success: true,
      data: { totalUsers: 5, totalJobs: 10, totalApplications: 20, totalCompanies: 3, usersByRole: {}, recentUsers: [] },
    }),
  },
}));

vi.mock("@/services/company.service", () => ({
  companyService: { list: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

vi.mock("@/services/savedJob.service", () => ({
  savedJobService: { list: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

vi.mock("@/services/application.service", () => ({
  applicationService: { getMyApplications: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

vi.mock("@/services/interview.service", () => ({
  interviewService: { getMyInterviews: vi.fn().mockResolvedValue({ success: true, data: [] }) },
}));

vi.mock("@/services/message.service", () => ({
  messageService: {
    getConversations: vi.fn().mockResolvedValue({ success: true, data: [] }),
  },
}));

vi.mock("@/services/candidate.service", () => ({
  candidateService: { search: vi.fn().mockResolvedValue({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } }) },
}));

vi.mock("@/store/toastStore", () => ({
  useToastStore: vi.fn(() => ({ addToast: vi.fn() })),
}));

vi.mock("@/store/authStore", () => ({
  useAuthStore: vi.fn((selector: any) =>
    selector({ user: { id: "1", role: "admin", fullName: "Admin" }, isAuthenticated: true })
  ),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Page render tests", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders AdminDashboardPage", async () => {
    render(<AdminDashboardPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("admin.dashboardTitle")).toBeInTheDocument();
    });
  });

  it("renders CompanyListPage", async () => {
    render(<CompanyListPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("company.listTitle")).toBeInTheDocument();
    });
  });

  it("renders SavedJobsPage", async () => {
    render(<SavedJobsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("saved.title")).toBeInTheDocument();
    });
  });

  it("renders MyApplicationsPage", async () => {
    render(<MyApplicationsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("myApplications.title")).toBeInTheDocument();
    });
  });

  it("renders MyInterviewsPage", async () => {
    render(<MyInterviewsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("myInterviews.title")).toBeInTheDocument();
    });
  });

  it("renders ConversationsPage", async () => {
    render(<ConversationsPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("messages.title")).toBeInTheDocument();
    });
  });

  it("renders CandidatesPage", async () => {
    render(<CandidatesPage />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText("candidates.title")).toBeInTheDocument();
    });
  });
});
