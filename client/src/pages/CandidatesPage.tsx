import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCandidates } from "@/hooks/useCandidates";
import type { CandidateSearchResult } from "@/types/candidate";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";
import { messageService } from "@/services/message.service";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { SimplePagination } from "@/components/Pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const CandidatesPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [skillsFilter, setSkillsFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [page, setPage] = useState(1);
  const user = useAuthStore((s) => s.user);
  const addToast = useToastStore((s) => s.addToast);

  const { data, isLoading, isError } = useCandidates({
    search: search || undefined,
    skills: skillsFilter || undefined,
    location: locationFilter || undefined,
    page,
    limit: 20,
  });

  const candidates = data?.data || [];
  const pagination = data?.pagination;

  const handleStartConversation = async (participantId: string) => {
    if (!user) return;
    try {
      const result = await messageService.getOrCreateConversation(participantId);
      const conversation = result.data;
      window.open(`/messages/${conversation._id}`, "_blank");
    } catch {
      addToast("error", t("common.error"));
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">{t("candidates.title")}</h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          {pagination ? t("candidates.foundCount", { count: pagination.total }) : t("candidates.search")}
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <input
          type="text"
          placeholder={t("candidates.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <input
          type="text"
          placeholder={t("candidates.skillsPlaceholder")}
          value={skillsFilter}
          onChange={(e) => { setSkillsFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        <input
          type="text"
          placeholder={t("candidates.locationPlaceholder")}
          value={locationFilter}
          onChange={(e) => { setLocationFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-800 placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {isLoading ? (
        <PageLoader />
      ) : isError ? (
        <p className="text-center text-red-500 dark:text-red-400">{t("common.error")}</p>
      ) : candidates.length === 0 ? (
        <EmptyState
          title={t("candidates.emptyTitle")}
          description={t("candidates.emptyDesc")}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {candidates.map((c: CandidateSearchResult) => (
              <div key={c._id} className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 text-lg font-bold text-primary-600 shadow-sm">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      c.fullName.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{c.fullName}</h3>
                    {c.title && <p className="text-sm text-gray-500 dark:text-gray-400">{c.title}</p>}
                    {c.location && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        {c.location}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleStartConversation(c._id)}>
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    {t("candidates.message")}
                  </Button>
                </div>
                {c.bio && <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{c.bio}</p>}
                {c.skills && c.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.skills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                    {c.skills.length > 6 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">+{c.skills.length - 6} {t("candidates.more")}</span>
                    )}
                  </div>
                )}
                {c.experience && c.experience.length > 0 && (
                  <div className="mt-3 border-t border-gray-50 dark:border-gray-800 pt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("candidates.experience")}</p>
                    {c.experience.slice(0, 2).map((exp, i) => (
                      <p key={i} className="mt-0.5 text-sm text-gray-700 dark:text-gray-300">
                        {exp.title} at {exp.company}{exp.current ? " (Current)" : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination && (
            <SimplePagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
};
