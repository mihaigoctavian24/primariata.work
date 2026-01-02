"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

/**
 * Hook for tracking unread notifications count
 * Subscribes to real-time updates on the notificari table
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
        .from("notificari")
        .select("*", { count: "exact", head: true })
        .eq("utilizator_id", userId)
        .eq("citita", false);

      if (!error && count !== null) {
        setUnreadCount(count);
      }
    };

    fetchUnreadCount();

    // Subscribe to real-time changes in notificari table
    const channel = supabase
      .channel("notificari-updates")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "notificari",
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
