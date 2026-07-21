import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jobService } from "@/services/job.service";
import { useToastStore } from "@/store/toastStore";
import { JobCardSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

export const MyJobsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["myJobs"],
    queryFn: () => jobService.getMyJobs(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myJobs"] });
      toast("success", "Job deleted");
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm(t("myJobs.deleteConfirm"))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="space-y-3 animate-slideUp">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  );
  if (isError) return <p className="text-center text-red-500">{t("common.error")}</p>;

  return (
    <div className="animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("myJobs.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{t("myJobs.count", { count: data?.data.length || 0 })}</p>
        </div>
        <Link
          to="/jobs/new"
          className="rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2 text-sm text-white shadow-sm transition-all hover:from-primary-600 hover:to-primary-700 hover:shadow-md"
        >
          + {t("myJobs.postJob")}
        </Link>
      </div>

      <div className="space-y-3">
        {data?.data.map((job, i) => (
          <div key={job._id} className="animate-slideUp group relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-primary-100 text-sm font-bold text-primary-600 shadow-sm">
                  {job.company?.name?.charAt(0) || "J"}
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-primary-600">{job.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{job.company?.name}</p>
                  <p className="mt-0.5 text-sm text-gray-400 dark:text-gray-500">
                    {job.location} &middot; {job.employmentType} &middot; {job.workMode}
                  </p>
                </div>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                  job.isActive
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                }`}
              >
                {job.isActive ? t("myJobs.active") : t("myJobs.inactive")}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{job.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.requiredSkills.slice(0, 4).map((skill) => (
                <span key={skill} className="rounded-md bg-gray-50 dark:bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700">
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 border-t border-gray-50 pt-3 text-sm">
              <Link to={`/jobs/${job._id}`} className="inline-flex items-center gap-1 font-medium text-primary-500 transition-colors hover:text-primary-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                {t("myJobs.view")}
              </Link>
              <Link to={`/jobs/${job._id}/edit`} className="inline-flex items-center gap-1 font-medium text-primary-500 transition-colors hover:text-primary-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                {t("myJobs.edit")}
              </Link>
              <Link to={`/jobs/${job._id}/applicants`} className="inline-flex items-center gap-1 font-medium text-primary-500 transition-colors hover:text-primary-600">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                {t("myJobs.applicants")}
              </Link>
              <button
                onClick={() => handleDelete(job._id)}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1 font-medium text-red-500 transition-colors hover:text-red-600 disabled:opacity-50"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                {t("myJobs.delete")}
              </button>
            </div>
          </div>
        ))}
        {data?.data.length === 0 && (
          <EmptyState
            icon={
              <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.913-.412m2.5 4.25h-15" />
              </svg>
            }
            title={t("myJobs.emptyTitle")}
            action={{ label: t("myJobs.postFirst"), to: "/jobs/new" }}
          />
        )}
      </div>
    </div>
  );
};
