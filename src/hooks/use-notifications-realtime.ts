"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Notification } from "@/types/notifications";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook for Supabase Realtime subscription to notifications table
 *
 * Features:
 * - Listens for INSERT, UPDATE, DELETE events on notifications table
 * - Auto-invalidates React Query cache for real-time UI updates
 * - Shows toast notification for new urgent/high priority notifications
 * - Handles connection errors gracefully
 * - Cleans up subscription on unmount
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useNotificationsRealtime } from '@/hooks/use-notifications-realtime'
 *
 * export function NotificationsPage() {
 *   useNotificationsRealtime() // Auto-subscribes and handles updates
 *   // ... rest of component
 * }
 * ```
 */
export function useNotificationsRealtime() {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">(
    "connecting"
  );

  useEffect(() => {
    const supabase = createClient();
    let channel: RealtimeChannel | null = null;

    async function setupRealtimeSubscription() {
      try {
        // Get current user to filter notifications
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error("Failed to get user for realtime subscription:", userError);
          setConnectionStatus("error");
          return;
        }

        if (!user) {
          console.warn("No user found, skipping realtime subscription");
          setConnectionStatus("error");
          return;
        }

        // Create channel with user-specific filter
        channel = supabase
          .channel("notifications-realtime")
          .on(
            "postgres_changes",
            {
              event: "*", // Listen for INSERT, UPDATE, DELETE
              schema: "public",
              table: "notifications",
              filter: `utilizator_id=eq.${user.id}`, // Only this user's notifications
            },
            (payload) => {
              console.log("Notification change detected:", payload.eventType, payload);

              // Invalidate all notification queries to trigger refetch
              queryClient.invalidateQueries({ queryKey: ["notifications"] });

              // Show toast for new urgent/high priority notifications
              if (payload.eventType === "INSERT") {
                const notification = payload.new as Notification;

                // Only show toast for urgent and high priority
                if (notification.priority === "urgent" || notification.priority === "high") {
                  toast.info(notification.title, {
                    description: notification.message,
                    duration: 5000, // 5 seconds for important notifications
                    action: notification.action_url
                      ? {
                          label: notification.action_label || "Vezi",
                          onClick: () => {
                            if (notification.action_url) {
                              window.open(notification.action_url, "_blank");
                            }
                          },
                        }
                      : undefined,
                  });
                }
              }
            }
          )
          .subscribe((status) => {
            console.log("Realtime subscription status:", status);

            if (status === "SUBSCRIBED") {
              setConnectionStatus("connected");
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              setConnectionStatus("error");
              console.error("Realtime subscription error:", status);

              // Show error toast only once per error
              toast.error("Conexiune întreruptă", {
                description: "Notificările în timp real sunt temporar indisponibile",
                duration: 4000,
              });
            }
          });
      } catch (error) {
        console.error("Failed to setup realtime subscription:", error);
        setConnectionStatus("error");

        toast.error("Eroare de conexiune", {
          description: "Nu s-a putut stabili conexiunea pentru notificări în timp real",
          duration: 4000,
        });
      }
    }

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return {
    connectionStatus,
    isConnected: connectionStatus === "connected",
  };
}
