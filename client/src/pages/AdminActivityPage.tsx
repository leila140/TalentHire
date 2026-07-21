import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import type { AdminActivityLog } from "@/types/admin";
import { timeAgo } from "@/utils/format";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-50 dark:bg-green-900/20 text-green-600",
  update: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  delete: "bg-red-50 dark:bg-red-900/20 text-red-600",
  login: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
  logout: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const ENTITY_COLORS: Record<string, string> = {
  User: "bg-violet-50 dark:bg-violet-900/20 text-violet-600",
  Job: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  Application: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
  Company: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600",
  Message: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600",
  Interview: "bg-rose-50 dark:bg-rose-900/20 text-rose-600",
};

export const AdminActivityPage = () => {
  const { t } = useTranslation();
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-activity", entityFilter, actionFilter, page],
    queryFn: () =>
      adminService.getActivityLogs({
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
        page,
        limit: 30,
      }),
    placeholderData: keepPreviousData,
  });

  const logs = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.activity.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pagination ? t("admin.activity.count", { count: pagination.total }) : t("common.loading")}
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
        <select
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">{t("admin.activity.allEntities")}</option>
          <option value="User">User</option>
          <option value="Job">Job</option>
          <option value="Application">Application</option>
          <option value="Company">Company</option>
          <option value="Message">Message</option>
          <option value="Interview">Interview</option>
        </select>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="">{t("admin.activity.allActions")}</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="login">Login</option>
          <option value="logout">Logout</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title={t("admin.activity.empty")}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.activity.user")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.activity.action")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.activity.entity")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.activity.details")}</th>
                    <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.activity.time")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {logs.map((log: AdminActivityLog) => {
                    const user = typeof log.user === "object" ? log.user : null;
                    const actionKey = log.action.split(".")[0] || log.action;
                    return (
                      <tr key={log._id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-4">
                          {user ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                {user.fullName?.charAt(0) || "?"}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100 text-xs">{user.fullName}</p>
                                <p className="text-[10px] text-gray-400 dark:text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${ACTION_COLORS[actionKey] || "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ENTITY_COLORS[log.entity] || "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
                            {log.entity}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-[200px]">
                          {log.metadata && Object.keys(log.metadata).length > 0 ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                              {Object.entries(log.metadata).slice(0, 2).map(([k, v]) => (
                                <p key={k} className="truncate">
                                  <span className="font-medium">{k}:</span> {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                </p>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500">
                          <span title={new Date(log.createdAt).toLocaleString()}>{timeAgo(log.createdAt)}</span>
                        </td>
                      </tr>
                    );
                  })}
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
