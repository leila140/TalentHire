import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useConversations } from "@/hooks/useMessages";
import { PageLoader } from "@/components/PageLoader";
import { EmptyState } from "@/components/EmptyState";
import { Badge } from "@/components/ui/badge";
import type { Conversation, Participant } from "@/types/message";

export const ConversationsPage = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError } = useConversations();

  const conversations = data?.data || [];

  const getOtherParticipant = (conv: Conversation): Participant | undefined =>
    conv.participants.find((p) => p._id !== user?.id);

  if (isLoading) return <PageLoader />;
  if (isError) return <p className="text-center text-red-500 dark:text-red-400">{t("common.error")}</p>;

  return (
    <div className="mx-auto max-w-2xl animate-slideUp">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t("messages.title")}</h1>
        <p className="mt-1 text-slate-500 dark:text-gray-400">{t("messages.description")}</p>
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          title={t("messages.emptyTitle")}
          description={t("messages.emptyDesc")}
        />
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const other = getOtherParticipant(conv);
            return (
              <Link
                key={conv._id}
                to={`/messages/${conv._id}`}
                className="group flex items-center gap-4 rounded-2xl border border-violet-100 bg-white/60 dark:border-gray-800 dark:bg-gray-900 p-4 shadow-md shadow-violet-500/5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-200 dark:hover:border-gray-700"
              >
                {other?.avatarUrl ? (
                  <img src={other.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/40 dark:to-blue-900/40 text-lg font-bold text-violet-600 dark:text-violet-400 shadow-sm">
                    {other?.fullName?.charAt(0) || "?"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 dark:text-gray-100 transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">{other?.fullName || "Unknown"}</p>
                  {conv.lastMessage && (
                    <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-gray-400">{conv.lastMessage}</p>
                  )}
                </div>
                {conv.lastMessageAt && (
                  <Badge variant="secondary" className="shrink-0">
                    {new Date(conv.lastMessageAt).toLocaleDateString()}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
