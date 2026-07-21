import { useEffect, useState, useRef, useCallback } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { connectSocket } from "@/services/socket";
import { notificationService } from "@/services/notification.service";
import type { AppNotification } from "@/types/notification";
import { ToastContainer } from "@/components/Toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { timeAgo } from "@/utils/format";

export const Layout = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated, getAccessToken } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

  const fetchCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const list = await notificationService.getNotifications(10);
      setNotifications(list);
    } catch {}
    setNotifLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchCount();
    const token = getAccessToken();
    if (!token) return;
    const socket = connectSocket(token);
    const onNotif = () => { fetchCount(); };
    socket.on("notification:new", onNotif);
    return () => { socket.off("notification:new", onNotif); };
  }, [isAuthenticated, fetchCount]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (notifRef.current?.contains(target) || mobileNotifRef.current?.contains(target)) return;
      setDropdownOpen(false);
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", onEscape);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [mobileMenuOpen]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  useEffect(() => {
    if (dropdownOpen) fetchNotifications();
  }, [dropdownOpen, fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleNotifClick = async (notif: AppNotification) => {
    setDropdownOpen(false);
    if (!notif.isRead) {
      await notificationService.markAsRead(notif._id);
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    if (notif.type === "new_message" && notif.metadata.conversationId) {
      navigate(`/messages/${notif.metadata.conversationId}`);
    } else if (notif.type === "new_application" && notif.metadata.jobId) {
      navigate(`/jobs/${notif.metadata.jobId}/applicants`);
    } else if (notif.type === "status_update" && notif.metadata.jobId) {
      navigate("/my-applications");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-lg shadow-primary-500/5 border-b border-white/20 dark:border-gray-800/50"
          : "bg-white/50 dark:bg-gray-950/50 border-b border-transparent"
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to={user ? "/dashboard" : "/"} className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent transition-all hover:from-violet-500 hover:to-blue-400">
            TalentHire
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 sm:flex">
            <Link to="/jobs" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
              isActive("/jobs") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
            }`}>
              {t("nav.browseJobs")}
            </Link>
            <Link to="/companies" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
              isActive("/companies") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
            }`}>
              {t("nav.companies")}
            </Link>
            {user ? (
              <>
                  {user.role === "candidate" && (
                    <>
                      <Link to="/my-applications" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                        isActive("/my-applications") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                      }`}>
                        {t("nav.myApplications")}
                      </Link>
                      <Link to="/my-interviews" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                        isActive("/my-interviews") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                      }`}>
                        {t("nav.myInterviews")}
                      </Link>
                      <Link to="/saved-jobs" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                        isActive("/saved-jobs") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                      }`}>
                        {t("nav.savedJobs")}
                      </Link>
                    </>
                  )}
                {user.role === "recruiter" && (
                  <>
                    <Link to="/recruiter/jobs" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                      isActive("/recruiter/jobs") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                    }`}>
                      {t("nav.myJobs")}
                    </Link>
                    <Link to="/recruiter/candidates" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                      isActive("/recruiter/candidates") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                    }`}>
                      {t("nav.candidates")}
                    </Link>
                    <Link
                      to="/jobs/new"
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
                    >
                      {t("nav.postJob")}
                    </Link>
                  </>
                )}
                <Link to="/messages" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                  isActive("/messages") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                }`}>
                  {t("nav.messages")}
                </Link>
                <Link to="/profile" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                  isActive("/profile") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                }`}>
                  {t("nav.profile")}
                </Link>

                {user.role === "admin" && (
                  <Link to="/admin" className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-all hover:bg-violet-50 dark:hover:bg-gray-800 ${
                    isActive("/admin") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400"
                  }`}>
                    {t("nav.admin")}
                  </Link>
                )}

                <LanguageSwitcher />
                <ThemeToggle />

                {/* Bell notification icon */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="relative rounded-xl p-1.5 text-slate-500 dark:text-gray-400 transition-all hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-300"
                    aria-label="Notifications"
                  >
                    {unreadCount > 0 ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                      </svg>
                    )}
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-950">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-3 w-80 origin-top-right rounded-2xl border border-white/30 bg-white/90 shadow-xl shadow-violet-500/10 backdrop-blur-xl ring-1 ring-violet-500/10 transition-all duration-200 dark:border-gray-800/50 dark:bg-gray-900/90 dark:shadow-black/50 dark:ring-gray-800 sm:w-96">
                        <div className="absolute -top-2 right-4 h-3 w-3 rotate-45 border-l border-t border-white/30 bg-white/90 backdrop-blur-xl dark:border-gray-800/50 dark:bg-gray-900/90" />

                        <div className="flex items-center justify-between rounded-t-2xl border-b border-violet-100 bg-gradient-to-r from-violet-50 via-blue-50 to-purple-50 px-5 py-3 dark:border-gray-800 dark:from-gray-800 dark:to-gray-900">
                          <span className="text-sm font-semibold text-slate-800 dark:text-gray-200">{t("nav.notifications")}</span>
                          {unreadCount > 0 && (
                            <button
                              onClick={handleMarkAllRead}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-violet-600 transition-all hover:bg-violet-100 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/20"
                            >
                              {t("nav.markAllRead")}
                            </button>
                          )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                          {notifLoading ? (
                            <div className="space-y-3 px-5 py-8">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex animate-pulse gap-3">
                                  <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-gray-700" />
                                  <div className="flex-1 space-y-1.5">
                                    <div className="h-3 w-3/4 rounded-lg bg-violet-100 dark:bg-gray-700" />
                                    <div className="h-2.5 w-1/4 rounded-lg bg-violet-50 dark:bg-gray-800" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center py-10">
                              <svg className="mb-2 h-10 w-10 text-violet-200 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                              </svg>
                              <p className="text-sm text-slate-400 dark:text-gray-500">{t("nav.allCaughtUp")}</p>
                            </div>
                          ) : (
                            notifications.map((n, idx) => (
                              <button
                                key={n._id}
                                onClick={() => handleNotifClick(n)}
                                className={`group relative flex w-full items-start gap-3 px-5 py-3.5 text-left text-sm transition-all hover:bg-violet-50/50 dark:hover:bg-gray-800 ${
                                  idx < notifications.length - 1 ? "border-b border-violet-50 dark:border-gray-800" : ""
                                } ${!n.isRead ? "bg-violet-50/30 dark:bg-violet-900/10" : ""}`}
                              >
                                <span
                                  className={`absolute left-0 top-0 h-full w-0.5 transition-colors ${
                                    !n.isRead ? "bg-gradient-to-b from-violet-500 to-blue-500" : "bg-transparent group-hover:bg-violet-200 dark:group-hover:bg-gray-700"
                                  }`}
                                />
                                <span
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                                    n.type === "new_message"
                                      ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
                                      : n.type === "new_application"
                                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30"
                                      : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30"
                                  }`}
                                >
                                  {n.type === "new_message" ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                  ) : n.type === "new_application" ? (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                  ) : (
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-sm leading-snug ${!n.isRead ? "font-medium text-slate-900 dark:text-gray-100" : "text-slate-600 dark:text-gray-400"}`}>
                                    {n.message}
                                  </p>
                                  <p className="mt-0.5 text-xs text-slate-400 dark:text-gray-500">{timeAgo(n.createdAt)}</p>
                                </div>
                                {!n.isRead && (
                                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="rounded-xl px-3 py-1.5 text-sm font-medium text-rose-500 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-red-900/20"
                >
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-gray-400 transition-all hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-600">
                  {t("nav.signIn")}
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-violet-500/25 transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-0.5"
                >
                  {t("nav.signUp")}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <div className="relative" ref={mobileNotifRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="relative rounded-xl p-1.5 text-slate-500 dark:text-gray-400 transition-all hover:bg-violet-50 dark:hover:bg-gray-800 hover:text-violet-600"
                aria-label="Notifications"
              >
                {unreadCount > 0 ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                )}
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] animate-pulse items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-950">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="rounded-xl p-1.5 text-slate-500 dark:text-gray-400 transition-all hover:bg-violet-50 dark:hover:bg-gray-800"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-violet-100 bg-white/90 px-4 py-3 backdrop-blur-xl sm:hidden dark:border-gray-800 dark:bg-gray-900/90">
            <div className="flex flex-col gap-1">
               <Link to="/jobs" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                 isActive("/jobs") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
               }`}>
                 {t("nav.browseJobs")}
               </Link>
               <Link to="/companies" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                 isActive("/companies") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
               }`}>
                 {t("nav.companies")}
               </Link>
               {user ? (
                 <>
                   {user.role === "candidate" && (
                     <>
                       <Link to="/my-applications" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                         isActive("/my-applications") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                       }`}>
                         {t("nav.myApplications")}
                       </Link>
                       <Link to="/my-interviews" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                         isActive("/my-interviews") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                       }`}>
                         {t("nav.myInterviews")}
                       </Link>
                       <Link to="/saved-jobs" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                         isActive("/saved-jobs") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                       }`}>
                         {t("nav.savedJobs")}
                       </Link>
                     </>
                   )}
                   {user.role === "recruiter" && (
                     <>
                       <Link to="/recruiter/jobs" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                         isActive("/recruiter/jobs") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                       }`}>
                         {t("nav.myJobs")}
                       </Link>
                       <Link to="/recruiter/candidates" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                         isActive("/recruiter/candidates") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                       }`}>
                         {t("nav.candidates")}
                       </Link>
                       <Link to="/jobs/new" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20">
                         + {t("nav.postJob")}
                       </Link>
                     </>
                   )}
                   <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                     isActive("/messages") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                   }`}>
                     {t("nav.messages")}
                   </Link>
                   <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                     isActive("/profile") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                   }`}>
                     {t("nav.profile")}
                   </Link>
                   {user.role === "admin" && (
                     <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                       isActive("/admin") ? "bg-gradient-to-r from-violet-50 to-blue-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800"
                     }`}>
                       {t("nav.admin")}
                     </Link>
                   )}
                   <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="rounded-xl px-3 py-2 text-left text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-red-900/20">
                     {t("nav.logout")}
                   </button>
                 </>
               ) : (
                 <>
                   <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-gray-800">
                     {t("nav.signIn")}
                   </Link>
                   <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-2 text-center text-sm font-medium text-white shadow-md shadow-violet-500/25">
                     {t("nav.signUp")}
                   </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
};
