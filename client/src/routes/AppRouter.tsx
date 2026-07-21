import { lazy, Suspense, useEffect, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "@/components/PageLoader";

const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/pages/RegisterPage").then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import("@/pages/DashboardPage").then(m => ({ default: m.DashboardPage })));
const JobListPage = lazy(() => import("@/pages/JobListPage").then(m => ({ default: m.JobListPage })));
const JobDetailPage = lazy(() => import("@/pages/JobDetailPage").then(m => ({ default: m.JobDetailPage })));
const CreateJobPage = lazy(() => import("@/pages/CreateJobPage").then(m => ({ default: m.CreateJobPage })));
const EditJobPage = lazy(() => import("@/pages/EditJobPage").then(m => ({ default: m.EditJobPage })));
const MyJobsPage = lazy(() => import("@/pages/MyJobsPage").then(m => ({ default: m.MyJobsPage })));
const CreateCompanyPage = lazy(() => import("@/pages/CreateCompanyPage").then(m => ({ default: m.CreateCompanyPage })));
const ProfilePage = lazy(() => import("@/pages/ProfilePage").then(m => ({ default: m.ProfilePage })));
const JobApplicantsPage = lazy(() => import("@/pages/JobApplicantsPage").then(m => ({ default: m.JobApplicantsPage })));
const MyApplicationsPage = lazy(() => import("@/pages/MyApplicationsPage").then(m => ({ default: m.MyApplicationsPage })));
const SavedJobsPage = lazy(() => import("@/pages/SavedJobsPage").then(m => ({ default: m.SavedJobsPage })));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage").then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPasswordPage").then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import("@/pages/VerifyEmailPage").then(m => ({ default: m.VerifyEmailPage })));
const EditCompanyPage = lazy(() => import("@/pages/EditCompanyPage").then(m => ({ default: m.EditCompanyPage })));
const ConversationsPage = lazy(() => import("@/pages/ConversationsPage").then(m => ({ default: m.ConversationsPage })));
const ChatPage = lazy(() => import("@/pages/ChatPage").then(m => ({ default: m.ChatPage })));
const RecruiterInterviewsPage = lazy(() => import("@/pages/RecruiterInterviewsPage").then(m => ({ default: m.RecruiterInterviewsPage })));
const MyInterviewsPage = lazy(() => import("@/pages/MyInterviewsPage").then(m => ({ default: m.MyInterviewsPage })));
const CandidatesPage = lazy(() => import("@/pages/CandidatesPage").then(m => ({ default: m.CandidatesPage })));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminCompaniesPage = lazy(() => import("@/pages/AdminCompaniesPage").then(m => ({ default: m.AdminCompaniesPage })));
const AdminJobsPage = lazy(() => import("@/pages/AdminJobsPage").then(m => ({ default: m.AdminJobsPage })));
const AdminApplicationsPage = lazy(() => import("@/pages/AdminApplicationsPage").then(m => ({ default: m.AdminApplicationsPage })));
const AdminReportsPage = lazy(() => import("@/pages/AdminReportsPage").then(m => ({ default: m.AdminReportsPage })));
const AdminActivityPage = lazy(() => import("@/pages/AdminActivityPage").then(m => ({ default: m.AdminActivityPage })));
const CompanyProfilePage = lazy(() => import("@/pages/CompanyProfilePage").then(m => ({ default: m.CompanyProfilePage })));
const CompanyListPage = lazy(() => import("@/pages/CompanyListPage").then(m => ({ default: m.CompanyListPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

export const AppRouter = () => {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const checked = useRef(false);

  useEffect(() => {
    if (!checked.current) {
      checked.current = true;
      if (!isAuthenticated) {
        checkAuth();
      }
    }
  }, []);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/companies" element={<CompanyListPage />} />
          <Route path="/companies/:id" element={<CompanyProfilePage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-applications" element={<MyApplicationsPage />} />
            <Route path="/saved-jobs" element={<SavedJobsPage />} />
            <Route path="/my-interviews" element={<MyInterviewsPage />} />
            <Route path="/messages" element={<ConversationsPage />} />
            <Route path="/messages/:conversationId" element={<ChatPage />} />
            <Route path="/recruiter/jobs" element={<MyJobsPage />} />

            <Route element={<ProtectedRoute roles={["recruiter"]} />}>
              <Route path="/company/create" element={<CreateCompanyPage />} />
              <Route path="/company/edit" element={<EditCompanyPage />} />
              <Route path="/jobs/new" element={<CreateJobPage />} />
              <Route path="/jobs/:id/edit" element={<EditJobPage />} />
              <Route path="/jobs/:id/applicants" element={<JobApplicantsPage />} />
              <Route path="/recruiter/interviews" element={<RecruiterInterviewsPage />} />
              <Route path="/recruiter/candidates" element={<CandidatesPage />} />
            </Route>

            <Route element={<ProtectedRoute roles={["admin"]} />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/companies" element={<AdminCompaniesPage />} />
              <Route path="/admin/jobs" element={<AdminJobsPage />} />
              <Route path="/admin/applications" element={<AdminApplicationsPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/activity" element={<AdminActivityPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
