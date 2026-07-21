import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAdminStats, useAdminAnalytics } from "@/hooks/useAdmin";
import { PageLoader } from "@/components/PageLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard, BarChart, PieChart, LineChart } from "@/components/Charts";

export const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useAdminStats();
  const { data: analyticsData } = useAdminAnalytics();

  if (isLoading) return <PageLoader />;

  const stats = data?.data;

  const statCards = [
    { label: t("admin.stats.totalUsers"), value: stats?.totalUsers ?? 0, color: "bg-blue-500" },
    { label: t("admin.stats.totalJobs"), value: stats?.totalJobs ?? 0, color: "bg-green-500" },
    { label: t("admin.stats.applications"), value: stats?.totalApplications ?? 0, color: "bg-purple-500" },
    { label: t("admin.stats.companies"), value: stats?.totalCompanies ?? 0, color: "bg-amber-500" },
  ];

  const managementLinks = [
    { label: t("admin.manageUsers"), path: "/admin/users", color: "from-blue-500 to-indigo-500" },
    { label: t("admin.manageJobs"), path: "/admin/jobs", color: "from-green-500 to-emerald-500" },
    { label: t("admin.manageApplications"), path: "/admin/applications", color: "from-purple-500 to-pink-500" },
    { label: t("admin.manageCompanies"), path: "/admin/companies", color: "from-amber-500 to-orange-500" },
    { label: t("admin.viewReports"), path: "/admin/reports", color: "from-rose-500 to-red-500" },
    { label: t("admin.viewActivity"), path: "/admin/activity", color: "from-cyan-500 to-teal-500" },
  ];

  return (
    <div className="animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("admin.dashboardTitle")}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{t("admin.dashboardDescription")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={`/admin${card.label === t("admin.stats.totalUsers") ? "/users" :
              card.label === t("admin.stats.totalJobs") ? "/jobs" :
              card.label === t("admin.stats.applications") ? "/applications" :
              "/companies"}`}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${card.color}`} />
            </div>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{card.value}</p>
          </Link>
        ))}
      </div>

      {stats?.usersByRole && (
        <div className="mt-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("admin.usersByRole")}</h2>
          <div className="flex flex-wrap gap-4 sm:gap-6">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="flex items-center gap-2">
                <span className="rounded-full bg-primary-50 dark:bg-primary-900/20 px-3 py-1 text-xs font-medium text-primary-600 capitalize">
                  {role}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analyticsData?.data && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {analyticsData.data.userGrowth.length > 0 && (
            <ChartCard title="User Signups (6 months)" className="sm:col-span-2 lg:col-span-2">
              <LineChart
                data={analyticsData.data.userGrowth.map((item) => ({ name: item.name, value: item.users }))}
                color="#8b5cf6"
              />
            </ChartCard>
          )}
          {analyticsData.data.applicationBreakdown.length > 0 && (
            <ChartCard title="Applications by Status">
              <PieChart data={analyticsData.data.applicationBreakdown} />
            </ChartCard>
          )}
          {analyticsData.data.jobTypeBreakdown.length > 0 && (
            <ChartCard title="Jobs by Employment Type">
              <BarChart data={analyticsData.data.jobTypeBreakdown} color="#10b981" />
            </ChartCard>
          )}
          {analyticsData.data.workModeBreakdown.length > 0 && (
            <ChartCard title="Jobs by Work Mode">
              <PieChart data={analyticsData.data.workModeBreakdown} />
            </ChartCard>
          )}
          {analyticsData.data.companyApprovalData.length > 0 && (
            <ChartCard title="Company Approval Status">
              <PieChart data={analyticsData.data.companyApprovalData} />
            </ChartCard>
          )}
          {analyticsData.data.activityTimeline.length > 0 && (
            <ChartCard title="Activity (30 days)" className="sm:col-span-2 lg:col-span-3">
              <BarChart
                data={analyticsData.data.activityTimeline.map((item) => ({ name: item.date.slice(5), value: item.actions }))}
                height={200}
                color="#3b82f6"
              />
            </ChartCard>
          )}
        </div>
      )}

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">{t("admin.quickManagement")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {managementLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="group flex items-start gap-4 rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-500/10 dark:border-violet-900/30 dark:bg-gray-900/80"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-white shadow-md transition-all group-hover:shadow-lg group-hover:scale-105`}>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 transition-colors group-hover:text-violet-600 dark:text-gray-100">{link.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {stats?.recentUsers && stats.recentUsers.length > 0 && (
        <div className="mt-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("admin.recentRegistrations")}</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((u: any) => (
              <div key={u._id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400">
                    {u.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{u.fullName}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs capitalize text-gray-600 dark:text-gray-400">
                    {u.role}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
