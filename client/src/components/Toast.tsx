import { useToastStore } from "@/store/toastStore";

import type { ReactNode } from "react";

const icons: Record<string, ReactNode> = {
  success: (
    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const accentBar: Record<string, string> = {
  success: "bg-green-500",
  error: "bg-red-500",
  info: "bg-blue-500",
};

const containerBg: Record<string, string> = {
  success: "bg-green-50 dark:bg-green-950/50",
  error: "bg-red-50 dark:bg-red-950/50",
  info: "bg-blue-50 dark:bg-blue-950/50",
};

export const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-20 z-[100] flex w-80 flex-col gap-2 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-[slideInRight_0.3s_ease-out] overflow-hidden rounded-lg shadow-lg ${containerBg[t.type]}`}
        >
          <div className="flex items-start gap-3 p-4">
            <div className="mt-0.5 shrink-0">{icons[t.type]}</div>
            <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded-full p-1 text-gray-400 dark:text-gray-500 transition-colors hover:bg-black/10 hover:text-gray-600 dark:hover:text-gray-300 dark:hover:bg-white/10"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="h-1 w-full bg-black/10 dark:bg-white/10">
            <div className={`h-full animate-[shrink_4s_linear] ${accentBar[t.type]}`} />
          </div>
        </div>
      ))}
    </div>
  );
};
