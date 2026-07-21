import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "@/services/api";

export const VerifyEmailPage = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }
    const verify = async () => {
      try {
        const { data } = await api.get(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may be expired.");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-white dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-lg border bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
        {status === "loading" && (
          <>
            <svg className="mx-auto mb-4 h-10 w-10 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("auth.verify.verifying")}</p>
          </>
        )}
        {status === "success" && (
          <>
            <svg className="mx-auto mb-4 h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <h1 className="mb-2 text-xl font-bold">{t("auth.verify.success")}</h1>
            <p className="mb-6 text-sm text-green-600">{message}</p>
            <Link to="/login" className="text-sm font-medium text-primary-500 hover:text-primary-600">
              {t("auth.verify.signIn")}
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <svg className="mx-auto mb-4 h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="mb-2 text-xl font-bold">{t("auth.verify.failed")}</h1>
            <p className="mb-6 text-sm text-red-500">{message}</p>
            <Link to="/login" className="text-sm font-medium text-primary-500 hover:text-primary-600">
              {t("auth.verify.backToSignIn")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
