import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMessages } from "@/hooks/useMessages";
import { getSocket, connectSocket } from "@/services/socket";
import { useAuthStore } from "@/store/authStore";
import { PageLoader } from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/types/message";

export const ChatPage = () => {
  const { t } = useTranslation();
  const { conversationId } = useParams<{ conversationId: string }>();
  const user = useAuthStore((s) => s.user);
  const getAccessToken = useAuthStore((s) => s.getAccessToken);
  const [input, setInput] = useState("");
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: initial, isError: messagesError } = useMessages(conversationId);

  const currentUserId = user?.id || (user as any)?._id || "";

  const allMessages = Object.values({
    ...Object.fromEntries((initial?.data || []).map((m) => [m._id, m])),
    ...Object.fromEntries(liveMessages.map((m) => [m._id, m])),
  });

  const isOwnMessage = (senderId: string) => String(senderId) === String(currentUserId);

  const unreadIds = allMessages
    .filter((m) => !m.isRead && !isOwnMessage(m.sender._id))
    .map((m) => m._id);

  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    if (!conversationId || !user) return;
    const token = getAccessToken();
    if (!token) return;
    const socket = connectSocket(token);

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = () => setSocketConnected(false);
    const onNewMessage = (msg: ChatMessage) => {
      setLiveMessages((prev) => {
        const optIdx = prev.findIndex((m) => m._id.startsWith("opt_") && m.content === msg.content);
        if (optIdx !== -1) {
          const updated = [...prev];
          updated[optIdx] = { ...updated[optIdx], _id: msg._id };
          return updated;
        }
        return [...prev, msg];
      });
    };
    const onTyping = ({ userId }: { userId: string | null }) => {
      setTypingUserId(userId);
    };

    if (socket.connected) setSocketConnected(true);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.emit("conversation:join", conversationId);
    socket.on("message:new", onNewMessage);
    socket.on("conversation:typing", onTyping);

    return () => {
      socket.emit("conversation:leave", conversationId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("message:new", onNewMessage);
      socket.off("conversation:typing", onTyping);
    };
  }, [conversationId, user]);

  useEffect(() => {
    if (unreadIds.length === 0 || !conversationId) return;
    const socket = getSocket();
    if (socket) {
      socket.emit("message:read", { conversationId, messageIds: unreadIds });
    }
  }, [unreadIds.length, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || !conversationId) return;
    const socket = getSocket();
    if (!socket) return;

    const optimistic: ChatMessage = {
      _id: "opt_" + Date.now(),
      conversation: conversationId,
      sender: { _id: currentUserId, fullName: user?.fullName || "" },
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setLiveMessages((prev) => [...prev, optimistic]);

    socket.emit("message:send", { conversationId, content });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !conversationId) return;
    socket.emit("conversation:typing", { conversationId });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col animate-slideUp" style={{ height: "calc(100vh - 120px)" }}>
      <div className="mb-4 flex items-center gap-3">
        <Link to="/messages" className="inline-flex items-center gap-1 text-sm text-violet-600 dark:text-violet-400 transition-colors hover:text-violet-700 dark:hover:text-violet-300">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          {t("chat.back")}
        </Link>
        <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("chat.title")}</h1>
      </div>
      {!socketConnected && (
        <div className="mb-2 flex items-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          {t("chat.disconnected")}
        </div>
      )}

      <div className="flex-1 overflow-y-auto rounded-2xl border border-violet-100 bg-white/60 dark:border-gray-800 dark:bg-gray-900 p-4 shadow-md shadow-violet-500/5">
        {messagesError && (
          <div className="flex flex-col items-center py-16 text-red-400 dark:text-red-500">
            <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
            <p className="text-sm font-medium">{t("common.error")}</p>
          </div>
        )}
        {!messagesError && allMessages.length === 0 && (
          <div className="flex flex-col items-center py-16 text-slate-400 dark:text-gray-500">
            <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p className="text-sm font-medium">{t("chat.noMessages")}</p>
            <p className="text-xs">{t("chat.sayHello")}</p>
          </div>
        )}
        {allMessages.map((msg) => {
          const isMine = isOwnMessage(msg.sender._id);
          return (
            <div key={msg._id} className={`mb-3 flex ${isMine ? "justify-end" : "justify-start"} animate-slideUp`}>
              <div
                className={`min-w-0 max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm break-words ${
                  isMine ? "bg-gradient-to-br from-violet-600 to-blue-500 text-white shadow-md shadow-violet-500/20" : "bg-violet-50 dark:bg-gray-800 text-slate-800 dark:text-gray-200 border border-violet-100 dark:border-gray-700"
                }`}
              >
                {!isMine && <p className="mb-0.5 text-xs font-medium opacity-70">{msg.sender.fullName}</p>}
                <p>{msg.content}</p>
                <p className={`mt-0.5 text-right text-[10px] ${isMine ? "text-white/70" : "text-slate-400 dark:text-gray-500"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        {typingUserId && !isOwnMessage(typingUserId) && (
          <div className="flex items-center gap-1.5 px-1 py-2 text-xs text-slate-400 dark:text-gray-500">
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
            </span>
            {t("chat.typing")}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          placeholder={t("chat.placeholder")}
          className="flex-1 rounded-xl border border-violet-200 bg-violet-50/50 dark:border-gray-700 dark:bg-gray-800 text-slate-800 dark:text-gray-100 px-4 py-2.5 text-sm outline-none transition-colors focus:border-violet-400 dark:focus:border-violet-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-violet-500/20"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim()}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
        </Button>
      </div>
    </div>
  );
};
