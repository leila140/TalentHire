import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "AR" },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs dark:border-gray-700 dark:bg-gray-800">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`rounded-md px-2 py-1 font-medium transition-colors ${
            i18n.language === lang.code
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
