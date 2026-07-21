import { useTranslation } from "react-i18next";

interface Props {
  overallScore: number;
  strongSkills?: string[];
  missingSkills?: string[];
  weakPoints?: string[];
  suggestions?: string[];
  compact?: boolean;
}

const scoreColor = (score: number) => {
  if (score >= 75) return { text: "text-green-600 dark:text-green-400", ring: "ring-green-200 dark:ring-green-800", bg: "bg-green-50 dark:bg-green-900/20", bar: "bg-green-500" };
  if (score >= 50) return { text: "text-yellow-600 dark:text-yellow-400", ring: "ring-yellow-200 dark:ring-yellow-800", bg: "bg-yellow-50 dark:bg-yellow-900/20", bar: "bg-yellow-500" };
  return { text: "text-red-600 dark:text-red-400", ring: "ring-red-200 dark:ring-red-800", bg: "bg-red-50 dark:bg-red-900/20", bar: "bg-red-500" };
};

export const AiScoreCard = ({ overallScore, strongSkills, missingSkills, weakPoints, suggestions, compact }: Props) => {
  const { t } = useTranslation();
  const colors = scoreColor(overallScore);

  return (
    <div className={`rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm ${compact ? "text-sm" : ""}`}>
      <div className="flex items-center gap-4">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${colors.bg} ${colors.text} text-2xl font-bold ring-4 ${colors.ring}`}>
          {overallScore}
        </div>
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("aiScore.title")}</div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
            <div className={`h-full rounded-full transition-all duration-500 ${colors.bar}`} style={{ width: `${overallScore}%` }} />
          </div>
          <p className={`mt-1 text-xs font-medium ${colors.text}`}>
            {overallScore >= 75 ? t("aiScore.strongMatch") : overallScore >= 50 ? t("aiScore.averageMatch") : t("aiScore.needsImprovement")}
          </p>
        </div>
      </div>

      {strongSkills && strongSkills.length > 0 && (
        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">{t("aiScore.strongSkills")}</p>
          <div className="flex flex-wrap gap-1.5">
            {strongSkills.map((s) => (
              <span key={s} className="rounded-md bg-green-50 dark:bg-green-900/20 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 ring-1 ring-green-200 dark:ring-green-800">{s}</span>
            ))}
          </div>
        </div>
      )}

      {missingSkills && missingSkills.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">{t("aiScore.missingSkills")}</p>
          <div className="flex flex-wrap gap-1.5">
            {missingSkills.map((s) => (
              <span key={s} className="rounded-md bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800">{s}</span>
            ))}
          </div>
        </div>
      )}

      {weakPoints && weakPoints.length > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">{t("aiScore.weakPoints")}</p>
          <ul className="list-inside list-disc space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
            {weakPoints.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">{t("aiScore.suggestions")}</p>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <svg className="mt-0.5 h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
