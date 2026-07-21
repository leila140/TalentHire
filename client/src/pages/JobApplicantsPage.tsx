import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/services/job.service";
import { applicationService } from "@/services/application.service";
import { messageService } from "@/services/message.service";
import { useToastStore } from "@/store/toastStore";
import { Modal } from "@/components/Modal";
import { ScheduleInterviewModal } from "@/components/ScheduleInterviewModal";
import { AiScoreCard } from "@/components/AiScoreCard";
import { aiService } from "@/services/ai.service";
import { ListSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";
import type { MatchResult } from "@/types/ai";

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  "under-review": "bg-yellow-50 text-yellow-600",
  interview: "bg-purple-50 text-purple-600",
  accepted: "bg-green-50 dark:bg-green-900/20 text-green-600",
  rejected: "bg-red-50 dark:bg-red-900/20 text-red-600",
  withdrawn: "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  "under-review": "Under Review",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const JobApplicantsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.addToast);
  const [rejectApp, setRejectApp] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [scheduleModal, setScheduleModal] = useState<{ applicationId: string; candidateName: string } | null>(null);
  const [matchResult, setMatchResult] = useState<{ appId: string; result: MatchResult } | null>(null);
  const [matchingApp, setMatchingApp] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ appId: string; list: { question: string; category: string; difficulty: string; reason: string }[] } | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState<string | null>(null);

  const { data: jobData } = useQuery({
    queryKey: ["job", id],
    queryFn: () => jobService.getById(id!),
    enabled: !!id,
  });

  const { data: appsData, isLoading, isError } = useQuery({
    queryKey: ["job-applicants", id],
    queryFn: () => applicationService.getJobApplicants(id!),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ appId, status, reason }: { appId: string; status: string; reason?: string }) =>
      applicationService.updateStatus(appId, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-applicants", id] });
      setRejectApp(null);
      setRejectReason("");
      toast("success", "Status updated");
    },
  });

  const handleMessage = async (candidateId: string) => {
    try {
      const res = await messageService.getOrCreateConversation(candidateId);
      navigate(`/messages/${res.data._id}`);
    } catch {
      toast("error", "Failed to open conversation");
    }
  };

  const handleReject = () => {
    if (!rejectApp) return;
    statusMutation.mutate({ appId: rejectApp.id, status: "rejected", reason: rejectReason || undefined });
  };

  if (isLoading) return (
    <div className="mx-auto max-w-4xl animate-slideUp">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <ListSkeleton rows={3} />
    </div>
  );
  if (isError) return <p className="text-center text-red-500">Failed to load applicants.</p>;

  const job = jobData?.data;
  const applicants = appsData?.data || [];

  return (
    <div className="mx-auto max-w-4xl animate-slideUp">
      <Link to="/recruiter/jobs" className="mb-4 inline-flex items-center gap-1 text-sm text-primary-500 transition-colors hover:text-primary-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to my jobs
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">{job?.title || "Job Applicants"}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">{applicants.length} applicant{applicants.length !== 1 ? "s" : ""}</p>
      </div>

      {applicants.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          title="No applicants yet"
          description="Applications will appear here once candidates apply"
        />
      ) : (
        <div className="space-y-4">
          {applicants.map((app, i) => {
            const candidate = typeof app.candidate === "string" ? null : app.candidate;

            return (
              <div key={app._id} className="animate-slideUp group relative overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary-400 to-primary-600 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {candidate?.avatarUrl ? (
                      <img src={candidate.avatarUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-primary-100 text-lg font-bold text-primary-600 shadow-sm">
                        {candidate?.fullName?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{candidate?.fullName || "Unknown"}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{candidate?.email}</p>
                      {candidate?.skills && candidate.skills.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {candidate.skills.slice(0, 5).map((s) => (
                            <span key={s} className="rounded-md bg-gray-50 dark:bg-gray-900 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[app.status] || "bg-gray-100 dark:bg-gray-800"}`}>
                    {STATUS_LABELS[app.status] || app.status}
                  </span>
                </div>

                {app.coverLetter && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">Cover Letter</p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{app.coverLetter}</p>
                  </div>
                )}

                {app.rejectionReason && (
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    <span className="font-medium">Rejection reason: </span>{app.rejectionReason}
                  </div>
                )}

                {candidate?.resumeUrl && (
                  <div className="mt-3">
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                      View Resume
                    </a>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-50 pt-3">
                  {candidate && (
                    <>
                      <button
                        onClick={() => {
                          const matchApp = matchResult?.appId === app._id ? matchResult : null;
                          if (matchApp) { setMatchResult(matchApp); return; }
                          setMatchingApp(app._id);
                          aiService.matchCandidate(app._id)
                            .then((res) => {
                              setMatchResult({ appId: app._id, result: res.data });
                              queryClient.invalidateQueries({ queryKey: ["job-applicants", id] });
                            })
                            .catch((err) => toast("error", err.response?.data?.message || "Failed to analyze match"))
                            .finally(() => setMatchingApp(null));
                        }}
                        disabled={matchingApp === app._id}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                      >
                        {matchingApp === app._id ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Matching...
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                            {matchResult?.appId === app._id ? "View Match" : "Match Candidate"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setLoadingQuestions(app._id);
                          aiService.getQuestions(app._id)
                            .then((res) => setQuestions({ appId: app._id, list: res.data }))
                            .catch((err) => toast("error", err.response?.data?.message || "Failed to generate questions"))
                            .finally(() => setLoadingQuestions(null));
                        }}
                        disabled={loadingQuestions === app._id}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                      >
                        {loadingQuestions === app._id ? (
                          <>
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                            Generating...
                          </>
                        ) : (
                          <>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            {questions?.appId === app._id ? "View Questions" : "Generate Questions"}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleMessage(candidate._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Message
                      </button>
                    </>
                  )}
                  {app.status === "applied" && (
                    <button
                      onClick={() => statusMutation.mutate({ appId: app._id, status: "under-review" })}
                      disabled={statusMutation.isPending}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                    >
                      Move to Review
                    </button>
                  )}
                  {app.status !== "accepted" && app.status !== "rejected" && app.status !== "withdrawn" && (
                    <>
                      {app.status !== "interview" ? (
                        <button
                          onClick={() =>
                            setScheduleModal({
                              applicationId: app._id,
                              candidateName: candidate?.fullName || "Unknown",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          Schedule Interview
                        </button>
                      ) : (
                        <Link
                          to={`/recruiter/interviews?jobId=${id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-100"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Manage Interview
                        </Link>
                      )}
                      <button
                        onClick={() => statusMutation.mutate({ appId: app._id, status: "accepted" })}
                        disabled={statusMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-100 dark:bg-green-900/30 disabled:opacity-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Accept
                      </button>
                      <button
                        onClick={() => setRejectApp({ id: app._id, name: candidate?.fullName || "this candidate" })}
                        disabled={statusMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:bg-red-900/20 disabled:opacity-50"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScheduleInterviewModal
        isOpen={!!scheduleModal}
        onClose={() => setScheduleModal(null)}
        applicationId={scheduleModal?.applicationId || ""}
        candidateName={scheduleModal?.candidateName || ""}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["job-applicants", id] })}
      />

      <Modal isOpen={!!matchResult} onClose={() => setMatchResult(null)}>
        {matchResult && (
          <div className="p-6">
            <h2 className="mb-4 text-lg font-bold">AI Match Result</h2>
            <AiScoreCard
              overallScore={matchResult.result.overallScore}
              strongSkills={matchResult.result.strongSkills}
              missingSkills={matchResult.result.missingSkills}
              weakPoints={matchResult.result.weakPoints}
              suggestions={matchResult.result.suggestions}
            />
            <div className="mt-4 flex justify-end">
              <button onClick={() => setMatchResult(null)} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!questions} onClose={() => setQuestions(null)}>
        {questions && (
          <div className="p-6">
            <h2 className="mb-1 text-lg font-bold">AI Interview Questions</h2>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Customized questions for this candidate</p>
            <ol className="space-y-3">
              {questions.list.map((q, i) => (
                <li key={i} className="rounded-lg bg-primary-50 dark:bg-primary-900/20 px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                  <span className="mr-2 font-bold text-primary-600">{i + 1}.</span>
                  {q.question}
                  <div className="mt-1 flex gap-2">
                    <span className="rounded-full bg-primary-100 dark:bg-primary-800 px-2 py-0.5 text-xs text-primary-700 dark:text-primary-300">{q.category}</span>
                    <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-400">{q.difficulty}</span>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setQuestions(null)} className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!rejectApp} onClose={() => { setRejectApp(null); setRejectReason(""); }}>
        <div className="p-6">
          <h2 className="mb-2 text-lg font-bold">Reject {rejectApp?.name}</h2>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">Provide a reason so the candidate understands why.</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            placeholder="Tell the candidate why they were not selected..."
          />
          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => { setRejectApp(null); setRejectReason(""); }}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={statusMutation.isPending}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white shadow-sm transition-all hover:bg-red-600 disabled:opacity-50"
            >
              {statusMutation.isPending ? "Rejecting..." : "Confirm Reject"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
