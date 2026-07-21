import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import type { AdminApplication } from "@/types/admin";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  "under-review": "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600",
  interview: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
  accepted: "bg-green-50 dark:bg-green-900/20 text-green-600",
  rejected: "bg-red-50 dark:bg-red-900/20 text-red-600",
  withdrawn: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  "under-review": "Under Review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const AdminApplicationsPage = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-applications", statusFilter, page],
    queryFn: () =>
      adminService.getApplications({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
        limit: 20,
      }),
    placeholderData: keepPreviousData,
  });

  const applications = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.applications.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pagination ? t("admin.applications.count", { count: pagination.total }) : t("common.loading")}
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t("common.backToDashboard")}
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">{t("admin.applications.allStatus")}</option>
          <option value="applied">{STATUS_LABELS.applied}</option>
          <option value="under-review">{STATUS_LABELS["under-review"]}</option>
          <option value="interview">{STATUS_LABELS.interview}</option>
          <option value="accepted">{STATUS_LABELS.accepted}</option>
          <option value="rejected">{STATUS_LABELS.rejected}</option>
          <option value="withdrawn">{STATUS_LABELS.withdrawn}</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title={t("admin.applications.empty")}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.applications.candidate")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.applications.job")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.applications.company")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.applications.status")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.applications.aiScore")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.applications.applied")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {applications.map((app: AdminApplication) => (
                    <tr key={app._id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {app.candidate?.avatarUrl ? (
                            <img src={app.candidate.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400">
                              {app.candidate?.fullName?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{app.candidate?.fullName || "—"}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{app.candidate?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/jobs/${app.job?._id}`} className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          {app.job?.title || "—"}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{app.job?.company?.name || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[app.status] || ""}`}>
                          {STATUS_LABELS[app.status] || app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {app.aiScore != null ? (
                          <span className={`text-sm font-bold ${
                            app.aiScore >= 70 ? "text-green-600" : app.aiScore >= 50 ? "text-yellow-600" : "text-red-500"
                          }`}>
                            {app.aiScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
              >
                {t("common.previous")}
              </button>
              <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
                {t("common.pageOf", { page: pagination.page, pages: pagination.pages })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
