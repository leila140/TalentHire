import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import type { AdminJob } from "@/types/admin";
import { useToastStore } from "@/store/toastStore";
import { Modal } from "@/components/Modal";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

const WORK_MODE_COLORS: Record<string, string> = {
  remote: "bg-green-50 dark:bg-green-900/20 text-green-600",
  hybrid: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  "on-site": "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

export const AdminJobsPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminJob | null>(null);
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-jobs", search, activeFilter, workModeFilter, page],
    queryFn: () =>
      adminService.getJobs({
        search: search || undefined,
        isActive: activeFilter === "all" ? undefined : activeFilter,
        workMode: workModeFilter === "all" ? undefined : workModeFilter,
        page,
        limit: 20,
      }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      addToast("success", t("admin.jobs.deleteSuccess"));
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      addToast("error", err.response?.data?.message || t("admin.jobs.deleteError"));
      setDeleteTarget(null);
    },
  });

  const jobs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.jobs.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pagination ? t("admin.jobs.count", { count: pagination.total }) : t("common.loading")}
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t("common.backToDashboard")}
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={t("admin.jobs.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">{t("admin.jobs.allStatus")}</option>
          <option value="true">{t("admin.jobs.active")}</option>
          <option value="false">{t("admin.jobs.inactive")}</option>
        </select>
        <select
          value={workModeFilter}
          onChange={(e) => { setWorkModeFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">{t("admin.jobs.allModes")}</option>
          <option value="remote">{t("admin.jobs.remote")}</option>
          <option value="hybrid">{t("admin.jobs.hybrid")}</option>
          <option value="on-site">{t("admin.jobs.onSite")}</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.913-.412m2.5 4.25h-15" />
            </svg>
          }
          title={t("admin.jobs.empty")}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.job")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.company")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.location")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.mode")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.type")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.status")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.postedBy")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.jobs.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {jobs.map((job: AdminJob) => (
                    <tr key={job._id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-5 py-4">
                        <Link to={`/jobs/${job._id}`} className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400">
                          {job.title}
                        </Link>
                        {job.requiredSkills?.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {job.requiredSkills.slice(0, 3).map((s) => (
                              <span key={s} className="rounded-md bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700">{s}</span>
                            ))}
                            {job.requiredSkills.length > 3 && (
                              <span className="text-[10px] text-gray-400">+{job.requiredSkills.length - 3}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{job.company?.name || "—"}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{job.location}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${WORK_MODE_COLORS[job.workMode] || ""}`}>
                          {job.workMode}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400 capitalize">{job.employmentType}</td>
                      <td className="px-5 py-4">
                        {job.isActive ? (
                          <span className="rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-600">{t("admin.jobs.active")}</span>
                        ) : (
                          <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-500">{t("admin.jobs.inactive")}</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{job.createdBy?.fullName || "—"}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/jobs/${job._id}`}
                            className="rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            {t("common.view")}
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(job)}
                            className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:bg-red-900/20"
                          >
                            {t("common.delete")}
                          </button>
                        </div>
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

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("admin.jobs.deleteTitle")}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("admin.jobs.deleteDesc", { title: deleteTarget?.title })}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {deleteMutation.isPending ? t("admin.jobs.deleting") : t("admin.jobs.confirmDelete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
