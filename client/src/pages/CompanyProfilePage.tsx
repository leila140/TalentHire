import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCompanyById, useCompanyJobs } from "@/hooks/useCompany";
import { PageLoader } from "@/components/PageLoader";
import type { CompanyJob } from "@/types/company";
import { timeAgo } from "@/utils/format";

const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  "on-site": "On-site",
};

const WORK_MODE_COLORS: Record<string, string> = {
  remote: "bg-green-50 dark:bg-green-900/20 text-green-600",
  hybrid: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  "on-site": "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
};

export const CompanyProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: companyData, isLoading: companyLoading, isError } = useCompanyById(id);
  const { data: jobsData, isLoading: jobsLoading } = useCompanyJobs(id, 1, 20);

  if (companyLoading) {
    return <PageLoader />;
  }

  if (isError || !companyData?.data) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400 dark:text-gray-500">
        <p className="text-lg font-medium dark:text-gray-300">{t("company.notFound")}</p>
        <Link to="/companies" className="mt-3 text-sm text-primary-500 hover:text-primary-600">
          {t("company.backToList")}
        </Link>
      </div>
    );
  }

  const company = companyData.data;
  const jobs = jobsData?.data || [];

  return (
    <div className="mx-auto max-w-4xl animate-slideUp space-y-6">
      <Link to="/companies" className="mb-2 inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-primary-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t("company.backToList")}
      </Link>

      <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="h-32 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-500" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-5 -mt-10">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="h-20 w-20 rounded-2xl border-4 border-white dark:border-gray-900 bg-white object-cover shadow-lg" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white dark:border-gray-900 bg-gradient-to-br from-violet-500 to-blue-500 text-2xl font-bold text-white shadow-lg">
                {company.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{company.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry} · {company.location}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span>{company.employees} employees</span>
            </div>
            {company.activeJobCount != null && (
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.913-.412M20.25 14.15l-1.428-4.675m-9.744 4.675l1.428-4.675m0 0L7.688 4.23A.464.464 0 007.233 4H4.493c-.332 0-.617.242-.686.543l-2.464 8.932m13.29 0l1.428 4.675" />
                </svg>
                <span>{company.activeJobCount} open positions</span>
              </div>
            )}
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary-500 hover:text-primary-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                <span>Website</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">{t("company.about")}</h2>
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-line">{company.description}</p>
      </div>

      {company.benefits && company.benefits.length > 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">{t("company.benefits")}</h2>
          <div className="flex flex-wrap gap-2">
            {company.benefits.map((b, i) => (
              <span key={i} className="rounded-full bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                {b}
              </span>
            ))}
          </div>
        </div>
      )}

      {company.gallery && company.gallery.length > 0 && (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-gray-800 dark:text-gray-100">{t("company.gallery")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {company.gallery.map((img) => (
              <div key={img._id} className="group relative overflow-hidden rounded-xl">
                <img src={img.url} alt={img.caption || ""} className="h-40 w-full object-cover transition-transform group-hover:scale-105" />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="text-xs text-white">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">
          {t("company.openPositions")} ({jobs.length})
        </h2>

        {jobsLoading ? (
          <PageLoader />
        ) : jobs.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">{t("company.noOpenPositions")}</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: CompanyJob) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="group flex items-center justify-between rounded-xl border border-gray-100 dark:border-gray-800 p-4 transition-all hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md hover:shadow-primary-500/5 dark:hover:border-primary-800"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-primary-600 dark:text-gray-100">
                    {job.title}
                  </h3>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span>·</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${WORK_MODE_COLORS[job.workMode] || ""}`}>
                      {WORK_MODE_LABELS[job.workMode] || job.workMode}
                    </span>
                    <span>·</span>
                    <span className="capitalize">{job.employmentType}</span>
                  </div>
                  {job.requiredSkills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {job.requiredSkills.slice(0, 5).map((s) => (
                        <span key={s} className="rounded-md bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-4 text-right shrink-0">
                  {job.salaryMin != null && job.salaryMax != null ? (
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {job.currency} {(job.salaryMin / 1000).toFixed(0)}k - {(job.salaryMax / 1000).toFixed(0)}k
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 dark:text-gray-500">{t("job.detail.salaryNotSpecified")}</p>
                  )}
                  <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500">{timeAgo(job.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
