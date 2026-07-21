import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import type { PopulatedJob } from "@/types/application";
import { AiScoreCard } from "@/components/AiScoreCard";
import { Modal } from "@/components/Modal";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMyApplications, useWithdrawApplication } from "@/hooks/useApplications";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  applied: "secondary",
  "under-review": "secondary",
  interview: "default",
  accepted: "default",
  rejected: "destructive",
  withdrawn: "outline",
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  "under-review": "Under Review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const MyApplicationsPage = () => {
  const { t } = useTranslation();
  const [scoreApp, setScoreApp] = useState<any>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<string | null>(null);

  const { data, isLoading, isError } = useMyApplications();
  const withdrawMutation = useWithdrawApplication();

  if (isLoading) return <PageLoader />;
  if (isError) return <p className="text-center text-red-500 dark:text-red-400">{t("common.error")}</p>;

  const apps = data?.data || [];

  return (
    <div className="mx-auto max-w-3xl animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold dark:text-gray-100">{t("myApplications.title")}</h1>
        <p className="mt-1 text-slate-500 dark:text-gray-400">{t("myApplications.count", { count: apps.length })}</p>
      </div>

      {apps.length === 0 ? (
        <EmptyState
          title={t("myApplications.emptyTitle")}
          action={{ label: t("myApplications.browseJobs"), to: "/jobs" }}
        />
      ) : (
        <>
        <div className="space-y-4">
          {apps.map((app, i) => {
            const job = typeof app.job === "string" ? null : (app.job as PopulatedJob);
            return (
              <div key={app._id} className="animate-slideUp rounded-2xl border border-violet-100 bg-white/60 p-5 shadow-md shadow-violet-500/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-200 dark:border-gray-800 dark:bg-gray-900 dark:shadow-black/20" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 text-sm font-bold text-violet-600 dark:text-violet-400 shadow-sm">
                      {job?.company?.name?.charAt(0) || "?"}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-800 dark:text-gray-100">{job?.title || "Unknown Position"}</h2>
                      <p className="text-sm text-slate-500 dark:text-gray-400">{job?.company?.name || ""}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-gray-500">
                        Applied {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {app.aiScore != null && (
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => setScoreApp(app)}
                      >
                        AI: {app.aiScore}
                      </Button>
                    )}
                    <Badge variant={STATUS_VARIANTS[app.status] || "secondary"}>
                      {STATUS_LABELS[app.status] || app.status}
                    </Badge>
                    {["applied", "under-review"].includes(app.status) && (
                      <Button
                        variant="destructive"
                        size="xs"
                        onClick={() => setWithdrawTarget(app._id)}
                      >
                        {t("myApplications.withdraw")}
                      </Button>
                    )}
                  </div>
                </div>
                {app.coverLetter && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-gray-400">{app.coverLetter}</p>
                )}
                {app.rejectionReason && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    <span className="font-medium">{t("myApplications.reason")}</span>{app.rejectionReason}
                  </div>
                )}
                <div className="mt-3 border-t border-violet-50 dark:border-gray-800 pt-3">
                  <Link to={`/jobs/${job?._id}`} className="inline-flex items-center gap-1 text-sm font-medium text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">
                    {t("myApplications.viewJobDetails")}
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <Modal isOpen={!!scoreApp} onClose={() => setScoreApp(null)}>
          {scoreApp && scoreApp.aiFeedback && (
            <div className="p-6">
              <h2 className="mb-4 text-lg font-bold dark:text-gray-100">{t("myApplications.aiFeedback")}</h2>
              <AiScoreCard
                overallScore={scoreApp.aiFeedback.overallScore}
                strongSkills={scoreApp.aiFeedback.strongSkills}
                missingSkills={scoreApp.aiFeedback.missingSkills}
                weakPoints={scoreApp.aiFeedback.weakPoints}
                suggestions={scoreApp.aiFeedback.suggestions}
              />
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setScoreApp(null)}>
                  {t("common.close")}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal isOpen={!!withdrawTarget} onClose={() => setWithdrawTarget(null)}>
          <div className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
              <svg className="h-6 w-6 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100">{t("myApplications.withdrawTitle")}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">{t("myApplications.withdrawDesc")}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={() => setWithdrawTarget(null)}>
                {t("common.cancel")}
              </Button>
              <Button
                variant="destructive"
                onClick={() => withdrawTarget && withdrawMutation.mutate(withdrawTarget)}
                disabled={withdrawMutation.isPending}
              >
                {withdrawMutation.isPending && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                )}
                {withdrawMutation.isPending ? t("myApplications.withdrawing") : t("myApplications.confirmWithdraw")}
              </Button>
            </div>
          </div>
        </Modal>
        </>
      )}
    </div>
  );
};
