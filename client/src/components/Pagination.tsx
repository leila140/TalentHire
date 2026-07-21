import { useTranslation } from "react-i18next";

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, onPageChange }: PaginationProps) {
  const { t } = useTranslation();

  if (pages <= 1) return null;

  const getVisiblePages = (): (number | "...")[] => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const visible: (number | "...")[] = [1];
    if (page > 3) visible.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      visible.push(i);
    }
    if (page < pages - 2) visible.push("...");
    visible.push(pages);
    return visible;
  };

  return (
    <div className="flex items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-xl border border-violet-200 dark:border-gray-700 px-3 py-1.5 text-sm text-slate-600 dark:text-gray-400 transition-colors hover:bg-violet-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("common.previous")}
      </button>
      {getVisiblePages().map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[2rem] rounded-xl px-2.5 py-1.5 text-sm font-medium transition-all ${
              p === page
                ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-md shadow-violet-500/25"
                : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="rounded-xl border border-violet-200 dark:border-gray-700 px-3 py-1.5 text-sm text-slate-600 dark:text-gray-400 transition-colors hover:bg-violet-50 dark:hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("common.next")}
      </button>
    </div>
  );
}

interface SimplePaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function SimplePagination({ page, pages, onPageChange }: SimplePaginationProps) {
  const { t } = useTranslation();

  if (pages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
      >
        {t("common.previous")}
      </button>
      <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
        {t("common.pageOf", { page, pages })}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
      >
        {t("common.next")}
      </button>
    </div>
  );
}
