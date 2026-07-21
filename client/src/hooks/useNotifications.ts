import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: ["notification-count"],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useNotifications(limit?: number) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => notificationService.getNotifications(limit),
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-count"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return { markAsRead, markAllAsRead };
}
