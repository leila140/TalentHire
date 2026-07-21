import axios from "axios";
import { useToastStore } from "@/store/toastStore";
import { useAuthStore } from "@/store/authStore";

export const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
});

const TOKEN_KEY = "accessToken";

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
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
