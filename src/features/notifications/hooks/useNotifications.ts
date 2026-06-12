import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type NotificationRow } from '../api/notifications-api';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (limit: number) => ['notifications', 'list', limit] as const,
};

export function useNotifications(limit = 50) {
  return useQuery({
    queryKey: notificationKeys.list(limit),
    queryFn: () => notificationsApi.list(limit),
  });
}

/** Optimistically mark a single row read, persisting `read_at`. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationsApi.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: async () => {
      const now = new Date().toISOString();
      queryClient.setQueriesData<NotificationRow[]>(
        { queryKey: notificationKeys.all },
        (rows) => rows?.map((r) => (r.read_at ? r : { ...r, read_at: now })),
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
