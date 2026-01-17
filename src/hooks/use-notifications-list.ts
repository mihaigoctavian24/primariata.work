"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResponse } from "@/types/api";
import type { Notification } from "@/types/notifications";
import type {
  NotificationTypeEnum,
  NotificationPriorityEnum,
  NotificationStatusEnum,
} from "@/lib/validations/notifications";

interface UseNotificationsListParams {
  page?: number;
  limit?: number;
  type?: NotificationTypeEnum;
  priority?: NotificationPriorityEnum;
  status?: NotificationStatusEnum;
  tab?: "toate" | "urgente" | "arhiva";
  search?: string;
  sort?: "created_at" | "updated_at" | "priority";
  order?: "asc" | "desc";
}

interface UseNotificationsListResult {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Query key factory for type safety and cache management
 * Ensures consistent query keys across the app
 */
export const notificationsQueryKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationsQueryKeys.all, "list"] as const,
  list: (filters: UseNotificationsListParams) =>
    [...notificationsQueryKeys.lists(), filters] as const,
};

/**
 * Custom hook for fetching notifications list with filters and pagination
 * Uses React Query for caching, loading states, and automatic refetching
 *
 * Pattern: Follows use-cereri-list.ts structure for consistency
 *
 * @param params - Filter and pagination parameters
 * @returns Query result with notifications data, pagination metadata, and unread count
 */
export function useNotificationsList(
  params: UseNotificationsListParams = {}
): UseNotificationsListResult {
  const {
    page = 1,
    limit = 10,
    type,
    priority,
    status,
    tab,
    search,
    sort = "created_at",
    order = "desc",
  } = params;

  const queryKey = notificationsQueryKeys.list({
    page,
    limit,
    type,
    priority,
    status,
    tab,
    search,
    sort,
    order,
  });

  const { data, isLoading, isError, error, refetch } = useQuery<
    PaginatedResponse<Notification> & { data: { unread_count: number } }
  >({
    queryKey,
    queryFn: async () => {
      // Build query string
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
        order,
      });

      // Optional filters
      if (type) queryParams.set("type", type);
      if (priority) queryParams.set("priority", priority);
      if (status) queryParams.set("status", status);
      if (tab) queryParams.set("tab", tab);
      if (search) queryParams.set("search", search);

      const response = await fetch(`/api/notifications?${queryParams.toString()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: { message: "Unknown error" } }));
        throw new Error(errorData.error?.message || "Failed to fetch notifications");
      }

      return response.json();
    },
    // Stale time of 30 seconds - data is considered fresh for this duration
    staleTime: 30 * 1000,
    // Refetch on window focus for fresh data
    refetchOnWindowFocus: true,
    // Keep previous data while fetching new page (smooth transitions)
    placeholderData: (previousData) => previousData,
  });

  return {
    notifications: data?.data.items || [],
    pagination: data?.data.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      total_pages: 0,
    },
    unreadCount: data?.data.unread_count || 0,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
