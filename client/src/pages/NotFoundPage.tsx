import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const NotFoundPage = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div className="animate-fadeIn mb-6 text-8xl font-extrabold text-primary-500/20 dark:text-primary-400/20">
        404
      </div>
      <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
        Page Not Found
      </h1>
      <p className="mb-8 max-w-sm text-gray-500 dark:text-gray-400">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="rounded-xl bg-primary-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
        >
          {t("common.back")} to Home
        </Link>
        <Link
          to="/jobs"
          className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Browse Jobs
        </Link>
      </div>
    </div>
  );
};
