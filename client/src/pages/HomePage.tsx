import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";

const HomePage = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-primary-50 to-indigo-50 dark:from-primary-600 dark:via-primary-500 dark:to-indigo-600">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-[float_6s_ease-in-out_infinite] absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary-200/40 dark:bg-white/5" />
        <div className="animate-[float_8s_ease-in-out_infinite] absolute right-20 top-1/4 h-24 w-24 rounded-full bg-indigo-200/40 dark:bg-white/5" />
        <div className="animate-[float_7s_ease-in-out_infinite_1s] absolute bottom-1/4 left-1/4 h-32 w-32 rounded-lg bg-primary-100/50 dark:bg-white/5" />
        <div className="animate-[float_9s_ease-in-out_infinite_2s] absolute -bottom-10 right-1/3 h-48 w-48 rounded-full bg-indigo-100/40 dark:bg-white/5" />
        <div className="animate-[float_5s_ease-in-out_infinite_0.5s] absolute left-1/2 top-1/3 h-16 w-16 rounded-lg bg-primary-200/30 dark:bg-white/5" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="animate-[fadeIn_0.6s_ease-out] mb-6 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700 dark:bg-white/10 dark:text-white/80">
          {t("home.tagline")}
        </div>
        <h1 className="animate-[fadeIn_0.8s_ease-out] mb-4 text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
          TalentHire
        </h1>
        <p className="animate-[fadeIn_1s_ease-out] mb-8 max-w-lg text-lg text-gray-600 dark:text-white/80 sm:text-xl">
          {t("home.subtitle")}
        </p>
        <div className="animate-[fadeIn_1.2s_ease-out] flex flex-col items-center gap-3 sm:flex-row">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="rounded-xl bg-primary-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:scale-105 hover:shadow-xl dark:bg-white dark:text-primary-600 dark:hover:bg-gray-100"
            >
              {t("dashboard.myProfile", { defaultValue: "Dashboard" })}
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="rounded-xl bg-primary-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:scale-105 hover:shadow-xl dark:bg-white dark:text-primary-600 dark:hover:bg-gray-100"
              >
                {t("home.getStarted")}
              </Link>
              <Link
                to="/login"
                className="rounded-xl border-2 border-primary-300 px-8 py-3 text-lg font-semibold text-primary-600 transition-all hover:border-primary-500 hover:bg-primary-50 dark:border-white/30 dark:text-white dark:hover:border-white/60 dark:hover:bg-white/10"
              >
                {t("home.signIn")}
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100/80 to-transparent dark:from-black/20" />
    </main>
  );
};

export default HomePage;
