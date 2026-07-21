import { Navigate, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types/auth";

interface Props {
  roles?: UserRole[];
}

export const ProtectedRoute = ({ roles }: Props) => {
  const { t } = useTranslation();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
