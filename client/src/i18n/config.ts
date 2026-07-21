import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import ar from "./locales/ar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    keySeparator: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "talenthire_lang",
    },
  });

const applyDirection = (lng: string) => {
  document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
};

i18n.on("languageChanged", applyDirection);
applyDirection(i18n.language);

export default i18n;
