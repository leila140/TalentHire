import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMyInterviews, useInterviewMutations } from "@/hooks/useInterviews";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  scheduled: "default",
  completed: "secondary",
  cancelled: "destructive",
};

export const MyInterviewsPage = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useMyInterviews();
  const { confirmMutation } = useInterviewMutations();

  const interviews = data?.data || [];

  return (
    <div className="mx-auto max-w-4xl animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t("myInterviews.title")}</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t("myInterviews.count", { count: interviews.length })}</p>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : interviews.length === 0 ? (
        <EmptyState
          title={t("myInterviews.emptyTitle")}
          description={t("myInterviews.emptyDesc")}
          action={{ label: t("myInterviews.browseJobs"), to: "/jobs" }}
        />
      ) : (
        <div className="space-y-4">
          {interviews.map((interview) => {
            const job = interview.application?.job;
            const company = (job as any)?.company;
            const isUpcoming = interview.status === "scheduled" && new Date(interview.scheduledAt) > new Date();
            const isConfirmed = interview.notes?.includes("[Candidate confirmed attendance]");

            return (
              <div key={interview._id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {company?.logo ? (
                        <img src={company.logo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/20 text-lg font-bold text-primary-600">
                          {company?.name?.charAt(0) || job?.title?.charAt(0) || "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{job?.title || "Unknown Position"}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{company?.name || "Unknown Company"}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(interview.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(interview.scheduledAt).toLocaleTimeString("en-US", {
                          hour: "2-digit", minute: "2-digit",
                        })} ({interview.duration} min)
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {interview.recruiter?.fullName}
                      </span>
                    </div>

                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 transition-colors hover:bg-primary-100 dark:hover:bg-primary-900/30"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        {t("myInterviews.joinMeeting")}
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={STATUS_VARIANT[interview.status] || "outline"}>
                      {interview.status}
                    </Badge>
                  </div>
                </div>

                {isUpcoming && !isConfirmed && (
                  <div className="mt-4 border-t border-gray-50 dark:border-gray-800 pt-3">
                    <Button
                      onClick={() => confirmMutation.mutate(interview._id)}
                      disabled={confirmMutation.isPending}
                    >
                      {confirmMutation.isPending ? t("myInterviews.confirming") : t("myInterviews.confirmAttendance")}
                    </Button>
                  </div>
                )}

                {isUpcoming && isConfirmed && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {t("myInterviews.attendanceConfirmed")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
