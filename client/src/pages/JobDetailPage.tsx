import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { jobService } from "@/services/job.service";
import { savedJobService } from "@/services/savedJob.service";
import { applicationService } from "@/services/application.service";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { Modal } from "@/components/Modal";
import { aiService } from "@/services/ai.service";
import { EmptyState } from "@/components/EmptyState";

export const JobDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobService.getById(id!),
    enabled: !!id,
  });

  const { data: myApps } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationService.getMyApplications(),
    enabled: user?.role === "candidate",
  });

  const toast = useToastStore((s) => s.addToast);

  const { data: savedData } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => savedJobService.list(),
    enabled: user?.role === "candidate",
  });
  const savedIds = new Set(savedData?.data?.map((s) => (typeof s.job === "string" ? s.job : s.job._id)) || []);
  const isSaved = id ? savedIds.has(id) : false;

  const saveMutation = useMutation({
    mutationFn: () => savedJobService.save(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-jobs"] }),
    onError: (err: any) => toast("error", err.response?.data?.message || "Failed to save job"),
  });

  const unsaveMutation = useMutation({
    mutationFn: () => savedJobService.unsave(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-jobs"] }),
    onError: (err: any) => toast("error", err.response?.data?.message || "Failed to unsave job"),
  });

  const applyMutation = useMutation({
    mutationFn: () => applicationService.apply(id!, coverLetter || undefined),
    onSuccess: () => {
      setShowModal(false);
      setCoverLetter("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
    },
  });

  const handleGenerateCoverLetter = async () => {
    if (!id) return;
    setGeneratingLetter(true);
    try {
      const res = await aiService.generateCoverLetter(id);
      setCoverLetter(res.data);
      toast("success", "Cover letter generated!");
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Failed to generate cover letter");
    } finally {
      setGeneratingLetter(false);
    }
  };

  if (isLoading) return (
    <div className="mx-auto max-w-4xl space-y-4 animate-slideUp">
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
        <div className="h-7 w-64 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-2 h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    </div>
  );
  if (isError || !data?.data) return (
    <div className="flex flex-col items-center py-20 text-gray-400 dark:text-gray-500">
      <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p className="text-lg font-medium">{t("job.detail.jobNotFound")}</p>
    </div>
  );

  const job = data.data;
  const alreadyApplied = myApps?.data?.some((a) => {
    const jobId = typeof a.job === "string" ? a.job : (a.job as any)?._id;
    return jobId === id;
  });

  return (
    <div className="mx-auto max-w-4xl animate-slideUp">
      <Link to="/jobs" className="mb-4 inline-flex items-center gap-1 text-sm text-violet-600 transition-colors hover:text-violet-700 dark:text-violet-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        {t("job.detail.back")}
      </Link>

      {/* Hero section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-500 p-6 text-white shadow-xl shadow-violet-500/20 sm:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute right-20 top-16 h-20 w-20 rounded-full bg-blue-400/10" />
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold backdrop-blur-sm">
              {job.company?.name?.charAt(0) || "J"}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="mt-1 text-violet-100">{job.company?.name}</p>
            </div>
          </div>
          <span className="whitespace-nowrap rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur-sm">
            {job.employmentType}
          </span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 p-6 shadow-md shadow-violet-500/5 backdrop-blur-xl">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-gray-100">
              <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              {t("job.detail.description")}
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-gray-300">{job.description}</p>
          </div>

          {/* Skills */}
          <div className="rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 p-6 shadow-md shadow-violet-500/5 backdrop-blur-xl">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-gray-100">
              <svg className="h-5 w-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              {t("job.detail.skills")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill) => (
                <span key={skill} className="rounded-full bg-violet-50 dark:bg-primary-900/20 px-3 py-1.5 text-sm font-medium text-violet-600 ring-1 ring-violet-200">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 p-5 shadow-md shadow-violet-500/5 backdrop-blur-xl">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">{t("job.detail.detailsTitle")}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 text-violet-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                <div><p className="text-slate-500 dark:text-gray-400">{t("job.detail.location")}</p><p className="font-medium text-slate-800 dark:text-gray-100">{job.location}</p></div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 text-violet-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                <div><p className="text-slate-500 dark:text-gray-400">{t("job.detail.workMode")}</p><p className="font-medium text-slate-800 dark:text-gray-100 capitalize">{job.workMode}</p></div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 text-violet-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div><p className="text-slate-500 dark:text-gray-400">{t("job.detail.salary")}</p><p className="font-medium text-green-600">{job.salaryMin ? `${job.currency} ${job.salaryMin.toLocaleString()}${job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : "+"}` : t("job.detail.salaryNotSpecified")}</p></div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 text-violet-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div><p className="text-slate-500 dark:text-gray-400">{t("job.detail.experience")}</p><p className="font-medium text-slate-800 dark:text-gray-100">{job.experienceMin}-{job.experienceMax} years</p></div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 text-violet-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <div><p className="text-slate-500 dark:text-gray-400">{t("job.detail.deadline")}</p><p className="font-medium text-slate-800 dark:text-gray-100">{new Date(job.deadline).toLocaleDateString()}</p></div>
              </div>
            </div>
          </div>

          {user?.role === "candidate" && (
            <div className="sticky top-20 rounded-2xl border border-violet-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900 p-5 shadow-md shadow-violet-500/5 backdrop-blur-xl">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">{t("job.detail.actions")}</h3>
              <div className="space-y-3">
                {!alreadyApplied ? (
                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5"
                  >
                    {t("job.detail.apply")}
                  </button>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-900/20 px-4 py-2.5 text-sm font-medium text-green-700">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t("job.detail.applied")}
                  </div>
                )}
                <button
                  onClick={() => (isSaved ? unsaveMutation.mutate() : saveMutation.mutate())}
                  disabled={saveMutation.isPending || unsaveMutation.isPending}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    isSaved
                      ? "border-primary-200 bg-primary-50 dark:bg-primary-900/20 text-primary-600 hover:bg-primary-100"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <svg className={`h-4 w-4 ${isSaved ? "text-primary-500" : ""}`} fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {isSaved ? t("job.detail.saved") : t("job.detail.save")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="mt-6 animate-slideUp rounded-xl border border-green-200 bg-green-50 dark:bg-green-900/20 px-5 py-4 text-sm text-green-700 shadow-sm">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t("job.detail.applicationSubmitted")}
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-bold text-slate-800 dark:text-white">{t("job.detail.applyFor", { title: job.title })}</h2>
          <p className="mb-4 text-sm text-slate-500 dark:text-gray-400">{t("job.detail.coverLetterHint")}</p>
          <div className="relative">
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-violet-200 dark:border-gray-700 bg-violet-50/50 dark:bg-gray-800 text-slate-800 dark:text-gray-100 px-3 py-2 text-sm outline-none transition-colors focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20"
              placeholder={t("job.detail.coverLetterPlaceholder")}
            />
            <button
              onClick={handleGenerateCoverLetter}
              disabled={generatingLetter}
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 disabled:opacity-50"
            >
              {generatingLetter ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  {t("job.detail.generating")}
                </>
              ) : (
                <>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                  {t("job.detail.generateCL")}
                </>
              )}
            </button>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => { setShowModal(false); setCoverLetter(""); }}
              className="rounded-xl border border-violet-200 dark:border-gray-700 px-4 py-2 text-sm text-slate-600 dark:text-gray-400 transition-colors hover:bg-violet-50 dark:hover:bg-gray-800"
            >
              {t("job.detail.cancel")}
            </button>
            <button
              onClick={() => applyMutation.mutate()}
              disabled={applyMutation.isPending}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 disabled:opacity-50"
            >
              {applyMutation.isPending ? t("job.detail.submitting") : t("job.detail.submitApplication")}
            </button>
          </div>
          {applyMutation.isError && (
            <p className="mt-3 text-sm text-red-500">
              {(applyMutation.error as any)?.response?.data?.message || "Failed to apply"}
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};
