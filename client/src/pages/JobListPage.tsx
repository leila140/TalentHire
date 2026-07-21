import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useJobs } from "@/hooks/useJobs";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useAuthStore } from "@/store/authStore";
import type { JobFilters } from "@/types/job";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/Pagination";
import { InlineLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";

const EMPLOYMENT_TYPES = ["full-time", "part-time", "contract", "internship"] as const;
const WORK_MODES = ["remote", "hybrid", "on-site"] as const;

export const JobListPage = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [employmentType, setEmploymentType] = useState(searchParams.get("employmentType") || "");
  const [workMode, setWorkMode] = useState(searchParams.get("workMode") || "");
  const user = useAuthStore((s) => s.user);

  const { savedIds, saveMutation, unsaveMutation } = useSavedJobs();

  const filters: JobFilters = {
    search: searchParams.get("search") || undefined,
    location: searchParams.get("location") || undefined,
    employmentType: (searchParams.get("employmentType") as any) || undefined,
    workMode: (searchParams.get("workMode") as any) || undefined,
    page: Number(searchParams.get("page")) || 1,
  };

  const { data, isLoading, isError } = useJobs(filters);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (employmentType) params.set("employmentType", employmentType);
    if (workMode) params.set("workMode", workMode);
    params.set("page", "1");
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearch("");
    setLocation("");
    setEmploymentType("");
    setWorkMode("");
    setSearchParams({});
  };

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

  return (
    <div className="animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">{t("job.list.title")}</h1>
        <p className="mt-1 text-slate-500 dark:text-gray-400">{t("job.list.subtitle")}</p>
      </div>

      <div className="mb-6 rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 p-4 shadow-md shadow-violet-500/5 backdrop-blur-xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("job.list.searchPlaceholder")}
              className="rounded-xl border-violet-200 dark:border-gray-700 bg-violet-50/50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 py-2 pl-9 pr-3 h-10 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-gray-500 z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("job.list.locationPlaceholder")}
              className="rounded-xl border-violet-200 dark:border-gray-700 bg-violet-50/50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 py-2 pl-9 pr-3 h-10 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
            />
          </div>
          <Select value={employmentType} onValueChange={(val) => setEmploymentType(val === "all" ? "" : val ?? "")}>
            <SelectTrigger className="rounded-xl border-violet-200 dark:border-gray-700 bg-violet-50/50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 h-10 w-full">
              <SelectValue placeholder={t("job.list.allTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("job.list.allTypes")}</SelectItem>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={workMode} onValueChange={(val) => setWorkMode(val === "all" ? "" : val ?? "")}>
            <SelectTrigger className="rounded-xl border-violet-200 dark:border-gray-700 bg-violet-50/50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 h-10 w-full">
              <SelectValue placeholder={t("job.list.allModes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("job.list.allModes")}</SelectItem>
              {WORK_MODES.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button
              onClick={applyFilters}
              className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 h-10"
            >
              {t("job.list.search")}
            </Button>
            <Button
              onClick={clearFilters}
              variant="outline"
              className="rounded-xl border-violet-200 dark:border-gray-700 px-3 py-2 text-sm text-slate-600 dark:text-gray-400 transition-colors hover:bg-violet-50 dark:hover:bg-gray-800 h-10"
            >
              {t("job.list.clear")}
            </Button>
          </div>
        </div>
      </div>

      {isLoading && <InlineLoader />}
      {isError && <p className="text-center text-red-500">{t("common.error")}</p>}

      <div className="space-y-3">
        {data?.data.map((job, i) => {
          const isSaved = savedIds.has(job._id);
          return (
            <div
              key={job._id}
              className="animate-slideUp group relative overflow-hidden rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 shadow-md shadow-violet-500/5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-200"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-400 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              <Link to={`/jobs/${job._id}`} className="block p-5 pl-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 text-sm font-bold text-white shadow-md shadow-violet-500/25">
                      {job.company?.name?.charAt(0) || "J"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-semibold text-slate-800 dark:text-gray-100 transition-colors group-hover:text-violet-600">{job.title}</h2>
                      <p className="text-sm text-slate-500 dark:text-gray-400">{job.company?.name}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="secondary" className="whitespace-nowrap bg-violet-50 dark:bg-primary-900/20 text-violet-600">
                      {job.employmentType}
                    </Badge>
                    {user?.role === "candidate" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          if (isSaved) {
                            unsaveMutation.mutate(job._id);
                          } else {
                            saveMutation.mutate(job._id);
                          }
                        }}
                        disabled={saveMutation.isPending || unsaveMutation.isPending}
                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-800"
                        title={isSaved ? t("job.list.removeSaved") : t("job.list.saveJob")}
                      >
                        <svg
                          className={`h-5 w-5 ${isSaved ? "text-primary-500" : "text-gray-400 dark:text-gray-500 hover:text-primary-400"}`}
                          fill={isSaved ? "currentColor" : "none"}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    {job.workMode}
                  </span>
                  {job.salaryMin && (
                    <span className="inline-flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {job.currency} {job.salaryMin.toLocaleString()}
                      {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : "+"}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t("job.list.exp", { min: job.experienceMin, max: job.experienceMax })}
                  </span>
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
                  {job.requiredSkills.length > 5 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">+{job.requiredSkills.length - 5} {t("job.list.more")}</span>
                  )}
                </div>
              </Link>
            </div>
          );
        })}
        {data?.data.length === 0 && (
          <EmptyState
            icon={
              <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
            title={t("job.list.emptyTitle")}
            description={t("job.list.emptyDesc")}
          />
        )}
      </div>

      {data?.pagination && (
        <div className="mt-8">
          <Pagination
            page={data.pagination.page}
            pages={data.pagination.pages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
};
