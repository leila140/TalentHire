import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "@/components/PageLoader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMyApplications } from "@/hooks/useApplications";
import { useMyJobs } from "@/hooks/useJobs";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const roleTitle: Record<string, string> = {
    candidate: t("dashboard.roleTitle.candidate"),
    recruiter: t("dashboard.roleTitle.recruiter"),
    admin: t("dashboard.roleTitle.admin"),
  };

  const { data: appsData, isLoading: appsLoading } = useMyApplications();
  const { data: jobsData, isLoading: jobsLoading } = useMyJobs();

  const isLoading = (user?.role === "candidate" && appsLoading) || (user?.role === "recruiter" && jobsLoading);

  const apps = (user?.role === "candidate" ? appsData?.data : []) || [];
  const jobs = (user?.role === "recruiter" ? jobsData?.data : []) || [];

  const statusCounts: Record<string, number> = {};
  apps.forEach((a) => { statusCounts[a.status] = (statusCounts[a.status] || 0) + 1; });

  const totalApplicants = jobs.reduce((sum, j) => sum + (j as any).applicantCount || 0, 0);

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-slideUp space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-500 p-8 shadow-xl shadow-violet-500/20 sm:p-10">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-20 top-16 h-20 w-20 rounded-full bg-blue-400/10" />
        <h1 className="text-2xl font-bold text-white sm:text-3xl">{roleTitle[user?.role || "candidate"]}</h1>
        <p className="mt-2 text-lg text-violet-100">{t("dashboard.welcomeBack", { name: user?.fullName })}</p>
      </div>

      {user?.role === "candidate" && apps.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {["applied", "under-review", "interview", "accepted"].map((s, i) => (
            <Card key={s} className="animate-slideUp text-center dark:border-gray-800 dark:bg-gray-900/80" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardContent className="p-5">
                <p className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-blue-500 bg-clip-text text-transparent">{statusCounts[s] || 0}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-gray-500">{t(`dashboard.status.${s.replace("-", "")}`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {user?.role === "recruiter" && jobs.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Card className="animate-slideUp text-center dark:border-gray-800 dark:bg-gray-900/80">
            <CardContent className="p-5">
              <p className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-blue-500 bg-clip-text text-transparent">{jobs.length}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-gray-500">{t("dashboard.activeJobs")}</p>
            </CardContent>
          </Card>
          <Card className="animate-slideUp text-center dark:border-gray-800 dark:bg-gray-900/80" style={{ animationDelay: "0.1s" }}>
            <CardContent className="p-5">
              <p className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-blue-500 bg-clip-text text-transparent">{totalApplicants}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-gray-500">{t("dashboard.totalApplicants")}</p>
            </CardContent>
          </Card>
          <Card className="animate-slideUp text-center dark:border-gray-800 dark:bg-gray-900/80" style={{ animationDelay: "0.2s" }}>
            <CardContent className="p-5">
              <p className="text-3xl font-bold bg-gradient-to-br from-violet-600 to-blue-500 bg-clip-text text-transparent">{jobs.filter((j) => j.isActive).length}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-gray-500">{t("dashboard.published")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {user?.role === "candidate" && (
          <>
            <Link to="/my-interviews" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md shadow-violet-500/25 transition-all group-hover:shadow-lg group-hover:shadow-violet-500/30 group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-violet-600 dark:text-gray-100">{t("dashboard.myInterviews")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t("dashboard.myInterviewsDesc")}</p>
              </div>
            </Link>
            <Link to="/my-applications" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-500/25 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.75H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-gray-100">{t("dashboard.myApplications")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                  {apps.length > 0 ? t("dashboard.myApplicationsCount", { count: apps.length }) : t("dashboard.myApplicationsDesc")}
                </p>
              </div>
            </Link>
            <Link to="/jobs" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/25 transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/30 group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-emerald-600 dark:text-gray-100">{t("dashboard.browseJobs")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t("dashboard.browseJobsDesc")}</p>
              </div>
            </Link>
          </>
        )}

        {user?.role === "recruiter" && (
          <>
            <Link to="/recruiter/interviews" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-md shadow-violet-500/25 transition-all group-hover:shadow-lg group-hover:shadow-violet-500/30 group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-violet-600 dark:text-gray-100">{t("dashboard.interviews")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t("dashboard.interviewsDesc")}</p>
              </div>
            </Link>
            <Link to="/recruiter/jobs" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.913-.412M20.25 14.15l-1.428-4.675m-9.744 4.675l1.428-4.675m0 0L7.688 4.23A.464.464 0 007.233 4H4.493c-.332 0-.617.242-.686.543l-2.464 8.932m13.29 0l1.428 4.675" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-blue-600 dark:text-gray-100">{t("dashboard.myJobs")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                  {jobs.length > 0 ? t("dashboard.myJobsCount", { count: jobs.length }) : t("dashboard.myJobsDesc")}
                </p>
              </div>
            </Link>
            <Link to="/jobs/new" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 transition-all group-hover:shadow-lg group-hover:shadow-amber-500/30 group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-amber-600 dark:text-gray-100">{t("dashboard.postJob")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t("dashboard.postJobDesc")}</p>
              </div>
            </Link>
            <Link to="/company/edit" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 transition-all group-hover:shadow-lg group-hover:shadow-rose-500/30 group-hover:scale-105">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-rose-600 dark:text-gray-100">{t("dashboard.myCompany")}</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t("dashboard.myCompanyDesc")}</p>
              </div>
            </Link>
          </>
        )}

        <Link to="/profile" className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/25 transition-all group-hover:shadow-lg group-hover:shadow-violet-500/30 group-hover:scale-105">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-slate-800 transition-colors group-hover:text-violet-600 dark:text-gray-100">{t("dashboard.myProfile")}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t("dashboard.myProfileDesc")}</p>
          </div>
        </Link>
      </div>

      {user?.role === "candidate" && apps.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-slate-800 dark:text-gray-100">{t("dashboard.recentApplications")}</h2>
          <div className="space-y-3">
            {apps.slice(0, 3).map((app) => {
              const job = typeof app.job === "string" ? null : (app.job as any);
              return (
                <Card key={app._id} className="dark:border-gray-800 dark:bg-gray-900/80">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-gray-100">{job?.title || "Unknown"}</p>
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-gray-400">{job?.company?.name}</p>
                      </div>
                      <Badge variant="secondary">{new Date(app.createdAt).toLocaleDateString()}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
