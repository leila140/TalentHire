import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("talenthire_theme") as Theme | null;
  if (stored) return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("talenthire_theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme: next };
    }),
  setTheme: (t) => {
    localStorage.setItem("talenthire_theme", t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    set({ theme: t });
  },
}));
