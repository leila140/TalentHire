import axios from "axios";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : "/api/v1",
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : "/api/v1",
  withCredentials: true,
});

const TOKEN_KEY = "talenthire_access_token";

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && !original.url?.includes("/auth/me")) {
      original._retry = true;
      try {
        await refreshApi.post("/auth/refresh");
        return api(original);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        useAuthStore.setState({ user: null, isAuthenticated: false });
        useToastStore.getState().addToast("error", "Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
