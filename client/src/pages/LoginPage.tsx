import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useToastStore } from "@/store/toastStore";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const googleLogin = useAuthStore((s) => s.googleLogin);
  const toast = useToastStore((s) => s.addToast);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      navigate("/dashboard");
    } catch (err: any) {
      toast("error", err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-600 to-blue-500 p-12 text-white lg:flex">
        <div className="animate-[fadeIn_0.6s_ease-out] max-w-md text-center">
          <h2 className="mb-4 text-4xl font-bold">{t("auth.login.welcome")}</h2>
          <p className="text-lg text-white/80">
            {t("auth.login.subtitle")}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-white/70">{t("auth.login.stats.jobsPosted")}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-sm text-white/70">{t("auth.login.stats.candidates")}</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm text-white/70">{t("auth.login.stats.satisfaction")}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-3xl border border-violet-100 bg-white/60 p-8 shadow-xl shadow-violet-500/5 backdrop-blur-xl dark:border-violet-900/30 dark:bg-gray-900/80">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t("auth.login.title")}</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">{t("auth.login.description")}</p>
            </div>
            <div>
              <input
                {...register("email")}
                placeholder={t("auth.login.emailPlaceholder")}
                className="w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-violet-900/30 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-violet-500 dark:focus:bg-gray-800"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register("password")}
                type="password"
                placeholder={t("auth.login.passwordPlaceholder")}
                className="w-full rounded-xl border border-violet-200 bg-violet-50/50 px-4 py-2.5 text-sm text-slate-800 transition-all placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-violet-900/30 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-violet-500 dark:focus:bg-gray-800"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t("auth.login.signingIn")}
                </span>
              ) : (
                t("auth.login.title")
              )}
            </button>
            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400">
                {t("auth.login.forgotPassword")}
              </Link>
            </div>
            <p className="text-center text-sm text-slate-500 dark:text-gray-400">
              {t("auth.login.noAccount")}{" "}
              <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400">
                {t("auth.login.register")}
              </Link>
            </p>
          </form>

          <div className="mt-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-violet-100 dark:border-violet-900/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/60 px-4 text-slate-400 dark:bg-gray-900/80 dark:text-gray-500">{t("auth.login.orContinueWith")}</span>
              </div>
            </div>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async ({ credential }) => {
                  if (!credential) return;
                  try {
                    await googleLogin(credential);
                    navigate("/dashboard");
                  } catch (err: any) {
                    toast("error", err.response?.data?.message || "Google login failed");
                  }
                }}
                onError={() => toast("error", "Google login failed")}
                theme="outline"
                size="large"
                text="signin_with"
                shape="rectangular"
                width="100%"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
