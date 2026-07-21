import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import type { AdminCompany } from "@/types/admin";
import { useToastStore } from "@/store/toastStore";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

export const AdminCompaniesPage = () => {
  const { t } = useTranslation();
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-companies", approvalFilter, page],
    queryFn: () =>
      adminService.getCompanies({
        isApproved: approvalFilter === "all" ? undefined : approvalFilter,
        page,
        limit: 20,
      }),
    placeholderData: keepPreviousData,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adminService.approveCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      addToast("success", "Company approval status updated");
    },
    onError: (err: any) => {
      addToast("error", err.response?.data?.message || "Failed to update company");
    },
  });

  const companies = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.companies.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pagination ? t("admin.companies.count", { count: pagination.total }) : t("common.loading")}
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
          value={approvalFilter}
          onChange={(e) => { setApprovalFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">{t("admin.companies.all")}</option>
          <option value="true">{t("admin.companies.approved")}</option>
          <option value="false">{t("admin.companies.pending")}</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : companies.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
          }
          title={t("admin.companies.empty")}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.companies.company")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.companies.industry")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.companies.location")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.companies.owner")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.companies.status")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.companies.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {companies.map((c: AdminCompany) => (
                  <tr key={c._id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">{c.name}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{c.industry}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{c.location}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">
                      {c.createdBy?.fullName || "Unknown"}
                    </td>
                    <td className="px-5 py-4">
                      {c.isApproved ? (
                        <span className="rounded-full bg-green-50 dark:bg-green-900/20 px-2.5 py-0.5 text-xs font-medium text-green-600">
                          {t("admin.companies.approved")}
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-600">
                          {t("admin.companies.pending")}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => approveMutation.mutate(c._id)}
                        disabled={approveMutation.isPending}
                        className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
                          c.isApproved
                            ? "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                            : "border-green-200 text-green-600 hover:bg-green-50 dark:bg-green-900/20"
                        } disabled:opacity-50`}
                      >
                        {c.isApproved ? t("admin.companies.revokeApproval") : t("admin.companies.approve")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
