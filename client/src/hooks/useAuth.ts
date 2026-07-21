import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const register = useAuthStore((s) => s.register);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const getAccessToken = useAuthStore((s) => s.getAccessToken);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
    googleLogin,
    checkAuth,
    getAccessToken,
    isCandidate: user?.role === "candidate",
    isRecruiter: user?.role === "recruiter",
    isAdmin: user?.role === "admin",
  };
}
