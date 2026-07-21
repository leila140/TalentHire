import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import type { AdminReport } from "@/types/admin";
import { useToastStore } from "@/store/toastStore";
import { Modal } from "@/components/Modal";

const REPORT_TYPES = [
  { value: "user_stats", label: "User Statistics" },
  { value: "job_stats", label: "Job Statistics" },
  { value: "application_stats", label: "Application Statistics" },
  { value: "company_stats", label: "Company Statistics" },
];

const REPORT_COLORS: Record<string, string> = {
  user_stats: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  job_stats: "bg-green-50 dark:bg-green-900/20 text-green-600",
  application_stats: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
  company_stats: "bg-amber-50 dark:bg-amber-900/20 text-amber-600",
};

export const AdminReportsPage = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState("user_stats");
  const [reportTitle, setReportTitle] = useState("");
  const [viewReport, setViewReport] = useState<AdminReport | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReport | null>(null);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", page],
    queryFn: () => adminService.getReports({ page, limit: 20 }),
    placeholderData: keepPreviousData,
  });

  const generateMutation = useMutation({
    mutationFn: () => adminService.generateReport(selectedType, reportTitle || undefined),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      addToast("success", t("admin.reports.generated"));
      setViewReport(res.data);
      setReportTitle("");
    },
    onError: (err: any) => {
      addToast("error", err.response?.data?.message || t("admin.reports.generateError"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
      addToast("success", t("admin.reports.deleted"));
      setDeleteTarget(null);
    },
  });

  const reports = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.reports.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pagination ? t("admin.reports.count", { count: pagination.total }) : t("common.loading")}
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t("common.backToDashboard")}
        </Link>
      </div>

      {/* Generate Report */}
      <div className="mb-6 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{t("admin.reports.generate")}</h2>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          >
            {REPORT_TYPES.map((rt) => (
              <option key={rt.value} value={rt.value}>{rt.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder={t("admin.reports.titlePlaceholder")}
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
          />
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-50"
          >
            {generateMutation.isPending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
            {t("admin.reports.generateBtn")}
          </button>
        </div>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 py-16 text-gray-400 dark:text-gray-500 shadow-sm">
          <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium">{t("admin.reports.empty")}</p>
          <p className="text-sm">{t("admin.reports.emptyHint")}</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {reports.map((report: AdminReport) => (
              <div key={report._id} className="flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <span className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${REPORT_COLORS[report.type] || "bg-gray-100 dark:bg-gray-800 text-gray-600"}`}>
                    {report.type.replace(/_/g, " ")}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{report.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t("admin.reports.generatedBy", { name: report.generatedBy?.fullName || "—" })} · {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewReport(report)}
                    className="rounded-md border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    {t("common.view")}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(report)}
                    className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:bg-red-900/20"
                  >
                    {t("common.delete")}
                  </button>
                </div>
              </div>
            ))}
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

      {/* View Report Modal */}
      <Modal isOpen={!!viewReport} onClose={() => setViewReport(null)}>
        {viewReport && (
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{viewReport.title}</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{viewReport.type.replace(/_/g, " ")}</p>
              </div>
              <span className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${REPORT_COLORS[viewReport.type] || ""}`}>
                {viewReport.type.replace(/_/g, " ")}
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(viewReport.data).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">{key.replace(/_/g, " ")}</p>
                  {typeof value === "object" && value !== null ? (
                    <div className="mt-2 space-y-1">
                      {Object.entries(value as Record<string, any>).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">{String(k).replace(/_/g, " ")}</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{typeof v === "object" ? JSON.stringify(v) : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={() => setViewReport(null)} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                {t("common.close")}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("admin.reports.deleteTitle")}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("admin.reports.deleteDesc", { title: deleteTarget?.title })}
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
              {deleteMutation.isPending ? t("admin.reports.deleting") : t("admin.reports.confirmDelete")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
