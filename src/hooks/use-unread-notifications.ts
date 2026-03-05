"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook for tracking unread notifications count.
 * Does an initial count fetch, then subscribes to real-time updates.
 * If realtime fails (CHANNEL_ERROR/TIMED_OUT), falls back to 30s polling.
 *
 * @param userId - Current user's ID
 * @param enabled - Whether to enable the subscription (default: true)
 * @returns count of unread notifications
 */
export function useUnreadNotifications(userId: string | null, enabled: boolean = true): number {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId || !enabled) {
      setUnreadCount(0);
      return;
    }

    const supabase = createClient();
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const fetchUnreadCount = async (): Promise<void> => {
      try {
        const { count, error } = await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("utilizator_id", userId)
          .is("read_at", null)
          .is("dismissed_at", null);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch {
        // Silently fail -- keep previous count
      }
    };

    // Initial fetch runs first, independently of realtime
    fetchUnreadCount();

    // Try realtime subscription with unique channel name per user
    const channel = supabase
      .channel(`notifications-unread-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `utilizator_id=eq.${userId}`,
        },
        () => {
          // Refetch count on any change
          fetchUnreadCount();
        }
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          // Fallback to polling when realtime fails -- do NOT reset count
          if (!pollInterval) {
            pollInterval = setInterval(fetchUnreadCount, 30000);
          }
        }
      });

    return () => {
      supabase.removeChannel(channel);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [userId, enabled]);

  return unreadCount;
}
