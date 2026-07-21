import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";

export const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {sent ? (
          <div className="rounded-3xl border border-violet-100 bg-white/60 p-8 text-center shadow-xl shadow-violet-500/5 backdrop-blur-xl dark:border-violet-900/30 dark:bg-gray-900/80">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-slate-800 dark:text-white">{t("auth.forgot.checkEmail")}</h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-gray-400">
              {t("auth.forgot.checkEmailDesc")}
            </p>
            <Link to="/login" className="text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
              {t("auth.forgot.backToSignIn")}
            </Link>
          </div>
        ) : (
          <div className="rounded-3xl border border-violet-100 bg-white/60 p-8 shadow-xl shadow-violet-500/5 backdrop-blur-xl dark:border-violet-900/30 dark:bg-gray-900/80">
            <h1 className="mb-2 text-2xl font-bold text-slate-800 dark:text-white">{t("auth.forgot.title")}</h1>
            <p className="mb-6 text-sm text-slate-500 dark:text-gray-400">
              {t("auth.forgot.description")}
            </p>
            <form onSubmit={onSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.forgot.emailPlaceholder")}
                required
                className="w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-violet-900/30 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-violet-500 dark:focus:bg-gray-800"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {loading ? t("auth.forgot.sending") : t("auth.forgot.sendResetLink")}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500 dark:text-gray-400">
              {t("auth.forgot.remember")}{" "}
              <Link to="/login" className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
                {t("auth.forgot.signIn")}
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
