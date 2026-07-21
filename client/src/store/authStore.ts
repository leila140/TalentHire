import { create } from "zustand";
import type { AuthUser } from "@/types/auth";
import { api } from "@/services/api";

const TOKEN_KEY = "talenthire_access_token";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    role: "candidate" | "recruiter";
  }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    const user = data.data as AuthUser;
    if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
    set({ user, isAuthenticated: true });
  },

  googleLogin: async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    const user = data.data as AuthUser;
    if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
    set({ user, isAuthenticated: true });
  },

  register: async (input) => {
    const { data } = await api.post("/auth/register", input);
    const user = data.data as AuthUser;
    if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const { data } = await api.get("/auth/me");
      if (data && data.data) {
        const user = data.data as AuthUser;
        if (data.accessToken) localStorage.setItem(TOKEN_KEY, data.accessToken);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
}));
