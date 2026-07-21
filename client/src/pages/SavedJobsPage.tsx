import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";

export const SavedJobsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading, isError, savedIds, unsaveMutation } = useSavedJobs();

  if (isLoading) return <PageLoader />;
  if (isError) return <p className="text-center text-red-500">{t("common.error")}</p>;

  const savedJobs = data?.data || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-gray-100">{t("saved.title")}</h1>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
          title={t("saved.empty")}
          action={{ label: t("saved.browseJobs"), to: "/jobs" }}
        />
      ) : (
        <div className="space-y-3">
          {savedJobs.map((saved) => {
            const job = saved.job;
            return (
              <div
                key={saved._id}
                className="flex items-start justify-between rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 p-5 shadow-md shadow-violet-500/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-200"
              >
                <Link to={`/jobs/${job._id}`} className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100">{job.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-gray-400">{job.company?.name}</p>
                    </div>
                    <Badge variant="secondary" className="whitespace-nowrap bg-violet-50 dark:bg-primary-900/20 text-violet-600">
                      {job.employmentType}
                    </Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
                    <span>{job.location}</span>
                    <span>{job.workMode}</span>
                    {job.salaryMin && (
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {job.currency} {job.salaryMin.toLocaleString()}
                        {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : "+"}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 5).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="rounded-full bg-violet-50 dark:bg-gray-900 text-violet-600 dark:text-gray-400 ring-1 ring-violet-200 dark:ring-gray-700 border-transparent"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => unsaveMutation.mutate(job._id)}
                  disabled={unsaveMutation.isPending}
                  className="ml-4 shrink-0 rounded-xl p-2 text-slate-400 dark:text-gray-500 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500"
                  title="Remove from saved"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
