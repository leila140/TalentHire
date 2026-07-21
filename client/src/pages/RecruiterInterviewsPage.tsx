import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMyJobs } from "@/hooks/useJobs";
import { useRecruiterInterviews, useInterviewMutations } from "@/hooks/useInterviews";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/Modal";
import type { Interview } from "@/types/interview";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "default",
  completed: "secondary",
  cancelled: "destructive",
};

export const RecruiterInterviewsPage = () => {
  const { t } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<string>("all");
  const [editInterview, setEditInterview] = useState<Interview | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editLink, setEditLink] = useState("");

  const { data: jobsData } = useMyJobs();
  const jobs = jobsData?.data || [];
  const jobIds = selectedJob === "all" ? jobs.map((j: any) => j._id) : [selectedJob];

  const { data: allInterviews, isLoading } = useRecruiterInterviews(selectedJob, jobIds);
  const { cancelMutation, completeMutation, updateMutation } = useInterviewMutations();

  const interviews = allInterviews || [];

  const getJobTitle = (interview: Interview) => {
    return interview.application?.job?.title || "Unknown Position";
  };

  const handleEdit = (interview: Interview) => {
    setEditInterview(interview);
    setEditDate(new Date(interview.scheduledAt).toISOString().slice(0, 16));
    setEditLink(interview.meetingLink || "");
  };

  return (
    <div className="mx-auto max-w-5xl animate-slideUp">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t("recruiterInterviews.title")}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t("recruiterInterviews.count", { count: interviews.length })}</p>
        </div>
        <select
          value={selectedJob}
          onChange={(e) => setSelectedJob(e.target.value)}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800"
        >
          <option value="all">{t("recruiterInterviews.allJobs")}</option>
          {jobs.map((job: any) => (
            <option key={job._id} value={job._id}>{job.title}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : interviews.length === 0 ? (
        <EmptyState
          title={t("recruiterInterviews.noInterviews")}
          description={t("recruiterInterviews.noInterviewsHint")}
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((interview: Interview) => (
            <div key={interview._id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {interview.candidate?.avatarUrl ? (
                    <img src={interview.candidate.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-lg font-bold text-primary-600">
                      {interview.candidate?.fullName?.charAt(0) || "?"}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{interview.candidate?.fullName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{interview.candidate?.email}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-700 dark:text-gray-300">{getJobTitle(interview)}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(interview.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "short", year: "numeric", month: "short", day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(interview.scheduledAt).toLocaleTimeString("en-US", {
                          hour: "2-digit", minute: "2-digit",
                        })} ({interview.duration}min)
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[interview.status] || "outline"}>
                  {interview.status}
                </Badge>
              </div>

              {interview.meetingLink && (
                <div className="mt-3">
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t("recruiterInterviews.joinMeeting")}
                  </a>
                </div>
              )}

              {interview.notes && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 italic">{t("recruiterInterviews.note", { note: interview.notes })}</p>
              )}

              {interview.status === "scheduled" && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 dark:border-gray-800 pt-3">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(interview)}>
                    {t("recruiterInterviews.reschedule")}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => completeMutation.mutate(interview._id)} disabled={completeMutation.isPending}>
                    {t("recruiterInterviews.markCompleted")}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => cancelMutation.mutate(interview._id)} disabled={cancelMutation.isPending}>
                    {t("recruiterInterviews.cancel")}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={!!editInterview} onClose={() => setEditInterview(null)}>
        <div className="p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-50">{t("recruiterInterviews.rescheduleTitle")}</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("recruiterInterviews.dateTime")}</label>
              <input
                type="datetime-local"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("recruiterInterviews.meetingLink")}</label>
              <input
                type="url"
                value={editLink}
                onChange={(e) => setEditLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditInterview(null)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (!editInterview) return;
                updateMutation.mutate({
                  id: editInterview._id,
                  data: {
                    scheduledAt: new Date(editDate).toISOString(),
                    meetingLink: editLink || undefined,
                  },
                });
              }}
              disabled={!editDate || updateMutation.isPending}
            >
              {updateMutation.isPending ? t("recruiterInterviews.saving") : t("recruiterInterviews.saveChanges")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
