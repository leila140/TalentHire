import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Modal } from "@/components/Modal";
import { interviewService } from "@/services/interview.service";
import { api } from "@/services/api";
import { useToastStore } from "@/store/toastStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  candidateName: string;
  onSuccess: () => void;
}

export const ScheduleInterviewModal = ({ isOpen, onClose, applicationId, candidateName, onSuccess }: Props) => {
  const { t } = useTranslation();
  const toast = useToastStore((s) => s.addToast);
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [useAiQuestions, setUseAiQuestions] = useState(false);

  const { data: aiQuestionsData } = useQuery({
    queryKey: ["ai-questions", applicationId],
    queryFn: () => api.get(`/ai/questions/${applicationId}`).then((r) => r.data),
    enabled: useAiQuestions && !!applicationId,
  });

  const scheduleMutation = useMutation({
    mutationFn: () =>
      interviewService.schedule({
        applicationId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        duration,
        meetingLink: meetingLink || undefined,
        notes: notes || undefined,
        aiQuestions: useAiQuestions ? aiQuestionsData?.data?.questions : undefined,
      }),
    onSuccess: () => {
      toast("success", "Interview scheduled successfully");
      onSuccess();
      handleClose();
    },
    onError: () => {
      toast("error", "Failed to schedule interview");
    },
  });

  const handleClose = () => {
    setScheduledAt("");
    setDuration(60);
    setMeetingLink("");
    setNotes("");
    setUseAiQuestions(false);
    onClose();
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <h2 className="mb-1 text-lg font-bold">{t("interview.schedule.title")}</h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{t("interview.schedule.with", { name: candidateName })}</p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("interview.schedule.dateTime")}</label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={minDateTime}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("interview.schedule.duration")}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            >
              <option value={30}>{t("interview.schedule.minutes", { count: 30 })}</option>
              <option value={45}>{t("interview.schedule.minutes", { count: 45 })}</option>
              <option value={60}>{t("interview.schedule.minutes", { count: 60 })}</option>
              <option value={90}>{t("interview.schedule.minutes", { count: 90 })}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("interview.schedule.meetingLink")}</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t("interview.schedule.notes")}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes for the candidate..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={useAiQuestions}
              onChange={(e) => setUseAiQuestions(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-primary-500 focus:ring-primary-400"
            />
            <span>{t("interview.schedule.generateAIQuestions")}</span>
          </label>

          {useAiQuestions && aiQuestionsData?.data?.questions && (
            <div className="rounded-lg bg-primary-50 dark:bg-primary-900/20 p-3">
              <p className="mb-1 text-xs font-medium text-primary-700 dark:text-primary-300">{t("interview.schedule.aiQuestionsNote")}</p>
              <ul className="list-inside list-disc text-xs text-primary-600 dark:text-primary-400">
                {aiQuestionsData.data.questions.slice(0, 3).map((q: { question: string; category: string; difficulty: string; reason: string }, i: number) => (
                  <li key={i}>{q.question}</li>
                ))}
                {aiQuestionsData.data.questions.length > 3 && (
                  <li className="list-none text-primary-400">+{aiQuestionsData.data.questions.length - 3} more</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={() => scheduleMutation.mutate()}
            disabled={!scheduledAt || scheduleMutation.isPending}
            className="rounded-lg bg-primary-500 px-4 py-2 text-sm text-white shadow-sm transition-all hover:bg-primary-600 disabled:opacity-50"
          >
            {scheduleMutation.isPending ? t("interview.schedule.scheduling") : t("interview.schedule.submit")}
          </button>
        </div>
      </div>
    </Modal>
  );
};
