"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Real-time update configuration intervals
 */
export type RefreshInterval = "off" | 30000 | 60000 | 300000; // off, 30s, 1min, 5min

export interface UseRealTimeDataOptions<T> {
  queryKey: string[];
  fetchFn: () => Promise<T>;
  refetchInterval?: RefreshInterval;
  enabled?: boolean;
  onUpdate?: (data: T) => void;
  onError?: (error: Error) => void;
  enableNotifications?: boolean;
  notificationMessage?: (data: T) => string | null;
}

export interface RealTimeState {
  isLive: boolean;
  lastUpdated: Date | null;
  isPulse: boolean;
  interval: RefreshInterval;
}

/**
 * Hook for real-time data with auto-refetch, optimistic updates, and notifications
 *
 * Features:
 * - Configurable refresh intervals (30s, 1min, 5min, off)
 * - Smart cache invalidation
 * - Retry logic with exponential backoff
 * - Loading states with progress indication
 * - Error recovery
 * - Toast notifications for updates
 * - Pulse animation triggers
 */
export function useRealTimeData<T>({
  queryKey,
  fetchFn,
  refetchInterval = 60000, // 1 minute default
  enabled = true,
  onUpdate,
  onError,
  enableNotifications = true,
  notificationMessage,
}: UseRealTimeDataOptions<T>) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<RealTimeState>({
    isLive: enabled && refetchInterval !== "off",
    lastUpdated: null,
    isPulse: false,
    interval: refetchInterval,
  });

  const previousDataRef = useRef<T | undefined>(undefined);
  const notificationDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Query with auto-refetch configuration
  const query = useQuery({
    queryKey,
    queryFn: fetchFn,
    refetchInterval: enabled && refetchInterval !== "off" ? refetchInterval : false,
    enabled,
    // Keep previous data while fetching
    placeholderData: (previousData) => previousData,
    // Refetch on window focus for real-time feel
    refetchOnWindowFocus: true,
    // Stale time: 1 minute for real-time data
    staleTime: 60 * 1000,
    // Retry with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Handle data updates
  useEffect(() => {
    if (query.data && query.isSuccess) {
      const hasChanged = JSON.stringify(previousDataRef.current) !== JSON.stringify(query.data);

      if (hasChanged && previousDataRef.current !== undefined) {
        // Trigger pulse animation
        setState((prev) => ({ ...prev, isPulse: true, lastUpdated: new Date() }));

        // Remove pulse after animation
        setTimeout(() => {
          setState((prev) => ({ ...prev, isPulse: false }));
        }, 1000);

        // Show notification (debounced)
        if (enableNotifications && notificationMessage) {
          if (notificationDebounceRef.current) {
            clearTimeout(notificationDebounceRef.current);
          }

          notificationDebounceRef.current = setTimeout(() => {
            const message = notificationMessage(query.data!);
            if (message) {
              toast.success(message, {
                duration: 3000,
                position: "bottom-right",
              });
            }
          }, 500); // 500ms debounce
        }

        // Call update callback
        if (onUpdate) {
          onUpdate(query.data);
        }
      }

      previousDataRef.current = query.data;
    }
  }, [query.data, query.isSuccess, onUpdate, enableNotifications, notificationMessage]);

  // Handle errors
  useEffect(() => {
    if (query.error) {
      console.error("Real-time data error:", query.error);

      if (onError) {
        onError(query.error as Error);
      }

      // Show error notification
      if (enableNotifications) {
        toast.error("Failed to fetch updates. Retrying...", {
          duration: 2000,
          position: "bottom-right",
        });
      }
    }
  }, [query.error, onError, enableNotifications]);

  // Manual invalidation
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  // Toggle live updates
  const toggleLive = useCallback(() => {
    setState((prev) => {
      const newIsLive = !prev.isLive;
      return {
        ...prev,
        isLive: newIsLive,
        interval: newIsLive ? prev.interval || 60000 : "off",
      };
    });
  }, []);

  // Change refresh interval
  const setRefreshInterval = useCallback(
    (interval: RefreshInterval) => {
      setState((prev) => ({
        ...prev,
        interval,
        isLive: interval !== "off",
      }));

      // Invalidate to apply new interval
      invalidate();
    },
    [invalidate]
  );

  // Manual refresh with loading toast
  const manualRefresh = useCallback(async () => {
    const toastId = toast.loading("Refreshing data...", {
      position: "bottom-right",
    });

    try {
      await query.refetch();
      toast.success("Data refreshed successfully", {
        id: toastId,
        duration: 2000,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error("Failed to refresh data", {
        id: toastId,
        duration: 2000,
      });
    }
  }, [query]);

  return {
    // Data
    data: query.data,

    // State flags
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isRefetching: query.isRefetching,
    isError: query.isError,
    isSuccess: query.isSuccess,
    error: query.error,

    // Real-time state
    isLive: state.isLive,
    lastUpdated: state.lastUpdated,
    isPulse: state.isPulse,
    interval: state.interval,

    // Actions
    invalidate,
    refetch: query.refetch,
    manualRefresh,
    toggleLive,
    setRefreshInterval,
  };
}

/**
 * Hook for optimistic mutations with automatic rollback on error
 */
export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  onSuccess,
  onError,
  updateOptimistically,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  updateOptimistically: (oldData: unknown, variables: TVariables) => unknown;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistically update cache
      queryClient.setQueryData(queryKey, (old: unknown) => updateOptimistically(old, variables));

      // Return context with snapshot
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback to previous data
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }

      toast.error("Action failed. Changes reverted.", {
        duration: 3000,
        position: "bottom-right",
      });

      if (onError) {
        onError(error as Error);
      }
    },
    onSuccess: (data) => {
      toast.success("Action completed successfully", {
        duration: 2000,
        position: "bottom-right",
      });

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
