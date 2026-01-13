"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook for tracking unread notifications count
 * Subscribes to real-time updates on the notifications table
 *
 * @param userId - Current user's ID
 * @param enabled - Whether to enable the subscription (default: true)
 * @returns count of unread notifications
 */
export function useUnreadNotifications(userId: string | null, enabled: boolean = true) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId || !enabled) {
      setUnreadCount(0);
      return;
    }

    const supabase = createClient();

    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("utilizator_id", userId)
        .is("read_at", null)
        .is("dismissed_at", null);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time changes in notifications table
    const channel = supabase
      .channel("notifications-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "notifications",
          filter: `utilizator_id=eq.${userId}`,
        },
        () => {
          // Refetch count on any change
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, enabled]);

  return unreadCount;
}
