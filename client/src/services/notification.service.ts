import { api } from "./api";
import type { AppNotification } from "@/types/notification";

export type { AppNotification } from "@/types/notification";

export const notificationService = {
  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get<{ success: boolean; data: { count: number } }>("/notifications/count");
    return data.data.count;
  },

  getNotifications: async (limit?: number): Promise<AppNotification[]> => {
    const { data } = await api.get<{ success: boolean; data: AppNotification[] }>(
      `/notifications?limit=${limit || 20}`
    );
    return data.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },
};
