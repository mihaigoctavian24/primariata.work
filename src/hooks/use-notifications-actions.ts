"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Notification } from "@/types/notifications";

/**
 * Action types for individual notification mutations
 */
type NotificationAction = "read" | "unread" | "archive" | "dismiss";

/**
 * Cached query data structure for notifications
 */
interface NotificationQueryData {
  data: {
    items: Notification[];
    unread_count: number;
  };
}

/**
 * Individual mutation variables
 */
interface NotificationMutationVariables {
  notificationId: string;
  action: NotificationAction;
}

/**
 * Batch mark-all-read variables
 */
interface MarkAllAsReadVariables {
  type?: string;
  priority?: string;
}

/**
 * API response for individual notification update
 */
interface NotificationUpdateResponse {
  success: boolean;
  data: Notification;
}

/**
 * API response for mark-all-read batch operation
 */
interface MarkAllAsReadResponse {
  success: boolean;
  data: {
    updated_count: number;
    message: string;
  };
}

/**
 * Hook for notification actions with React Query mutations
 *
 * FEATURES:
 * - 4 individual mutations: markAsRead, markAsUnread, dismiss, archive
 * - 1 batch mutation: markAllAsRead
 * - Optimistic updates for instant UX
 * - Auto-invalidate queries after success
 * - Toast notifications for feedback
 * - Error handling with retry logic
 * - TypeScript strict
 *
 * USAGE:
 * ```tsx
 * const {
 *   markAsRead,
 *   markAsUnread,
 *   dismiss,
 *   archive,
 *   markAllAsRead,
 *   isLoading
 * } = useNotificationActions();
 *
 * // Individual actions
 * markAsRead.mutate({ notificationId: "123" });
 *
 * // Batch action
 * markAllAsRead.mutate({ type: "cerere_status" });
 * ```
 */
export function useNotificationsActions() {
  const queryClient = useQueryClient();

  /**
   * Base mutation function for individual notification updates
   */
  const updateNotification = async ({
    notificationId,
    action,
  }: NotificationMutationVariables): Promise<NotificationUpdateResponse> => {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: { message: "Unknown error" } }));
      throw new Error(errorData.error?.message || `Failed to ${action} notification`);
    }

    return response.json();
  };

  /**
   * Mutation: Mark notification as read
   */
  const markAsRead = useMutation({
    mutationFn: (variables: { notificationId: string }) =>
      updateNotification({ ...variables, action: "read" }),

    // Optimistic update
    onMutate: async ({ notificationId }) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ["notifications"] });

      // Snapshot previous state
      const previousData = queryClient.getQueryData(["notifications"]);

      // Optimistically update cache
      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const typedOld = old as NotificationQueryData;
        if (!typedOld.data?.items) return old;

        const now = new Date().toISOString();

        return {
          ...typedOld,
          data: {
            ...typedOld.data,
            items: typedOld.data.items.map((notification: Notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    read_at: now,
                    dismissed_at: now, // Mark as read = archive
                  }
                : notification
            ),
            unread_count: Math.max((typedOld.data.unread_count || 0) - 1, 0),
          },
        };
      });

      return { previousData };
    },

    // Success handler
    onSuccess: () => {
      toast.success("Notificare marcată ca citită", {
        duration: 2000,
        position: "bottom-right",
      });
    },

    // Error handler with rollback
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }

      console.error("Error marking notification as read:", error);
      toast.error("Eroare la marcarea notificării ca citită", {
        duration: 3000,
        position: "bottom-right",
      });
    },

    // Always refetch to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },

    // Retry logic
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  /**
   * Mutation: Mark notification as unread
   */
  const markAsUnread = useMutation({
    mutationFn: (variables: { notificationId: string }) =>
      updateNotification({ ...variables, action: "unread" }),

    // Optimistic update
    onMutate: async ({ notificationId }) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData(["notifications"]);

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const typedOld = old as NotificationQueryData;
        if (!typedOld.data?.items) return old;

        return {
          ...typedOld,
          data: {
            ...typedOld.data,
            items: typedOld.data.items.map((notification: Notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    read_at: null,
                    dismissed_at: null, // Unmark as read = unarchive
                  }
                : notification
            ),
            unread_count: (typedOld.data.unread_count || 0) + 1,
          },
        };
      });

      return { previousData };
    },

    onSuccess: () => {
      toast.success("Notificare marcată ca necitită", {
        duration: 2000,
        position: "bottom-right",
      });
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }

      console.error("Error marking notification as unread:", error);
      toast.error("Eroare la marcarea notificării ca necitită", {
        duration: 3000,
        position: "bottom-right",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  /**
   * Mutation: Dismiss notification (soft delete via archive)
   */
  const dismiss = useMutation({
    mutationFn: (variables: { notificationId: string }) =>
      updateNotification({ ...variables, action: "dismiss" }),

    // Optimistic update
    onMutate: async ({ notificationId }) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData(["notifications"]);

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const typedOld = old as NotificationQueryData;
        if (!typedOld.data?.items) return old;

        const notification = typedOld.data.items.find((n: Notification) => n.id === notificationId);
        const wasUnread = notification && !notification.read_at;

        return {
          ...typedOld,
          data: {
            ...typedOld.data,
            items: typedOld.data.items.filter((n: Notification) => n.id !== notificationId),
            unread_count: wasUnread
              ? Math.max((typedOld.data.unread_count || 0) - 1, 0)
              : typedOld.data.unread_count,
          },
        };
      });

      return { previousData };
    },

    onSuccess: () => {
      toast.success("Notificare respinsă", {
        duration: 2000,
        position: "bottom-right",
      });
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }

      console.error("Error dismissing notification:", error);
      toast.error("Eroare la respingerea notificării", {
        duration: 3000,
        position: "bottom-right",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  /**
   * Mutation: Archive notification
   */
  const archive = useMutation({
    mutationFn: (variables: { notificationId: string }) =>
      updateNotification({ ...variables, action: "archive" }),

    // Optimistic update
    onMutate: async ({ notificationId }) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData(["notifications"]);

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const typedOld = old as NotificationQueryData;
        if (!typedOld.data?.items) return old;

        const notification = typedOld.data.items.find((n: Notification) => n.id === notificationId);
        const wasUnread = notification && !notification.read_at;

        return {
          ...typedOld,
          data: {
            ...typedOld.data,
            items: typedOld.data.items.map((n: Notification) =>
              n.id === notificationId
                ? {
                    ...n,
                    archived_at: new Date().toISOString(),
                    read_at: new Date().toISOString(),
                  }
                : n
            ),
            unread_count: wasUnread
              ? Math.max((typedOld.data.unread_count || 0) - 1, 0)
              : typedOld.data.unread_count,
          },
        };
      });

      return { previousData };
    },

    onSuccess: () => {
      toast.success("Notificare arhivată", {
        duration: 2000,
        position: "bottom-right",
      });
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }

      console.error("Error archiving notification:", error);
      toast.error("Eroare la arhivarea notificării", {
        duration: 3000,
        position: "bottom-right",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  /**
   * Mutation: Mark all notifications as read (batch operation)
   */
  const markAllAsRead = useMutation({
    mutationFn: async (variables: MarkAllAsReadVariables = {}): Promise<MarkAllAsReadResponse> => {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...variables,
          confirm: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to mark all as read");
      }

      return response.json();
    },

    // Optimistic update
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const previousData = queryClient.getQueryData(["notifications"]);

      queryClient.setQueriesData({ queryKey: ["notifications"] }, (old: unknown) => {
        if (!old || typeof old !== "object" || !("data" in old)) return old;
        const typedOld = old as NotificationQueryData;
        if (!typedOld.data?.items) return old;

        const now = new Date().toISOString();

        return {
          ...typedOld,
          data: {
            ...typedOld.data,
            items: typedOld.data.items.map((notification: Notification) => {
              // Apply filters if specified
              const matchesType = !variables.type || notification.type === variables.type;
              const matchesPriority =
                !variables.priority || notification.priority === variables.priority;
              const isUnread = !notification.read_at;

              if (matchesType && matchesPriority && isUnread) {
                // Mark as read AND dismiss (archive)
                return {
                  ...notification,
                  read_at: now,
                  dismissed_at: now,
                };
              }

              return notification;
            }),
            unread_count: 0, // Optimistically set to 0
          },
        };
      });

      return { previousData };
    },

    onSuccess: (data) => {
      toast.success(data.data.message || "Toate notificările au fost marcate ca citite", {
        duration: 2000,
        position: "bottom-right",
      });
    },

    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["notifications"], context.previousData);
      }

      console.error("Error marking all as read:", error);
      toast.error("Eroare la marcarea tuturor notificărilor", {
        duration: 3000,
        position: "bottom-right",
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-notifications-count"] });
    },

    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  /**
   * Combined loading state
   */
  const isLoading =
    markAsRead.isPending ||
    markAsUnread.isPending ||
    dismiss.isPending ||
    archive.isPending ||
    markAllAsRead.isPending;

  return {
    // Individual mutations
    markAsRead,
    markAsUnread,
    dismiss,
    archive,

    // Batch mutation
    markAllAsRead,

    // Combined state
    isLoading,
  };
}
