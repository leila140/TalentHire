import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import type { AdminUser } from "@/types/admin";
import { useToastStore } from "@/store/toastStore";
import { Modal } from "@/components/Modal";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

const ROLE_COLORS: Record<string, string> = {
  candidate: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
  recruiter: "bg-amber-50 text-amber-600",
  admin: "bg-purple-50 text-purple-600",
};

export const AdminUsersPage = () => {
  const { t } = useTranslation();
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState("");
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", roleFilter, search, page],
    queryFn: () =>
      adminService.getUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        search: search || undefined,
        page,
        limit: 20,
      }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      addToast("success", "User deleted successfully");
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      addToast("error", err.response?.data?.message || "Failed to delete user");
      setDeleteTarget(null);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      addToast("success", "User role updated");
      setRoleChangeTarget(null);
    },
    onError: (err: any) => {
      addToast("error", err.response?.data?.message || "Failed to update role");
      setRoleChangeTarget(null);
    },
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="animate-slideUp">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.users.title")}</h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {pagination ? t("admin.users.count", { count: pagination.total }) : t("common.loading")}
          </p>
        </div>
        <Link
          to="/admin"
          className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          {t("common.backToDashboard")}
        </Link>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder={t("admin.users.searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
        >
          <option value="all">{t("admin.users.allRoles")}</option>
          <option value="candidate">{t("admin.users.candidates")}</option>
          <option value="recruiter">{t("admin.users.recruiters")}</option>
          <option value="admin">{t("admin.users.admins")}</option>
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={
            <svg className="mb-3 h-14 w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
          title={t("admin.users.empty")}
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.users.user")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.users.email")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.users.role")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.users.verified")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.users.joined")}</th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-400">{t("admin.users.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map((u: AdminUser) => (
                  <tr key={u._id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-medium text-gray-900 dark:text-gray-100">{u.fullName}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[u.role] || "bg-gray-100 dark:bg-gray-800"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.isEmailVerified ? (
                        <span className="text-green-500">{t("common.yes")}</span>
                      ) : (
                        <span className="text-red-400">{t("common.no")}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 dark:text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setRoleChangeTarget(u); setNewRole(u.role); }}
                          className="rounded-md border border-gray-200 dark:border-gray-700 px-2.5 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          {t("admin.users.changeRole")}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 dark:bg-red-900/20"
                        >
                          {t("admin.users.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
              >
                {t("common.previous")}
              </button>
              <span className="px-3 text-sm text-gray-500 dark:text-gray-400">
                {t("common.pageOf", { page: pagination.page, pages: pagination.pages })}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("admin.users.deleteTitle")}</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t("admin.users.deleteDesc", { name: deleteTarget?.fullName })}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
            >
              {deleteMutation.isPending ? t("admin.users.deleting") : t("admin.users.confirmDelete")}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!roleChangeTarget} onClose={() => setRoleChangeTarget(null)}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t("admin.users.changeRoleTitle")}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t("admin.users.changeRoleDesc", { name: roleChangeTarget?.fullName })}
          </p>
          <div className="mt-4 space-y-2">
            {["candidate", "recruiter", "admin"].map((role) => (
              <label key={role} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 has-[:checked]:border-primary-400 has-[:checked]:bg-primary-50 dark:bg-primary-900/20">
                <input
                  type="radio"
                  name="newRole"
                  value={role}
                  checked={newRole === role}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="h-4 w-4 text-primary-500"
                />
                <span className="text-sm font-medium capitalize text-gray-900 dark:text-gray-100">{role}</span>
              </label>
            ))}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setRoleChangeTarget(null)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={() =>
                roleChangeTarget &&
                roleMutation.mutate({ id: roleChangeTarget._id, role: newRole })
              }
              disabled={roleMutation.isPending}
              className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
            >
              {roleMutation.isPending ? t("admin.users.updating") : t("common.save")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
