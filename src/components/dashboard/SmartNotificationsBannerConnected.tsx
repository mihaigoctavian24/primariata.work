"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SmartNotificationsBanner } from "./SmartNotificationsBanner";
import { useNotificationsList } from "@/hooks/use-notifications-list";
import { useNotificationsActions } from "@/hooks/use-notifications-actions";

interface SmartNotificationsBannerConnectedProps {
  maxDisplay?: number;
}

/**
 * Connected wrapper for SmartNotificationsBanner
 *
 * Integrates:
 * - Data fetching via useNotificationsList hook
 * - Dismiss mutations via useNotificationsActions hook
 * - Settings sync via localStorage and cross-tab events
 * - Router navigation for action URLs
 *
 * Visibility Logic:
 * - Hidden if push notifications disabled in localStorage
 * - Hidden if no active (non-dismissed) notifications
 * - Hidden while loading initial data
 *
 * @param maxDisplay - Maximum number of notifications to display (default: 5)
 */
export function SmartNotificationsBannerConnected({
  maxDisplay = 5,
}: SmartNotificationsBannerConnectedProps) {
  const router = useRouter();

  // State: Track push notification toggle from localStorage
  // Default: true (banner visible by default, user can disable in Settings)
  const [pushEnabled, setPushEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("notifications-push");
    // If not set yet, default to true (show banner)
    return stored === null ? true : stored === "true";
  });

  // Data fetching: Get notifications with pagination
  const { notifications, isLoading } = useNotificationsList({
    page: 1,
    limit: maxDisplay,
  });

  // Actions: Get dismiss mutation
  const { dismiss } = useNotificationsActions();

  // Effect: Listen to localStorage changes (cross-tab + same-tab sync)
  useEffect(() => {
    // Handler for storage events (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "notifications-push") {
        // Default to true if null (not set)
        setPushEnabled(e.newValue === null ? true : e.newValue === "true");
      }
    };

    // Handler for custom events (same-tab sync)
    const handleSettingsChange = () => {
      const stored = localStorage.getItem("notifications-push");
      // Default to true if null (not set)
      setPushEnabled(stored === null ? true : stored === "true");
    };

    // Add listeners
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("notification-settings-changed", handleSettingsChange);

    // Cleanup listeners
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notification-settings-changed", handleSettingsChange);
    };
  }, []);

  // Filter: Only show non-dismissed notifications
  const activeNotifications = notifications.filter((n) => !n.dismissed_at);

  // Visibility: Hide banner if conditions not met
  if (!pushEnabled || activeNotifications.length === 0 || isLoading) {
    return null;
  }

  // Handler: Dismiss notification
  const handleDismiss = (notificationId: string) => {
    dismiss.mutate({ notificationId });
  };

  // Handler: Navigate to action URL
  const handleAction = (notificationId: string, actionUrl: string) => {
    // Mark as read before navigating
    router.push(actionUrl);
  };

  return (
    <SmartNotificationsBanner
      notifications={activeNotifications}
      onDismiss={handleDismiss}
      onAction={handleAction}
      maxDisplay={maxDisplay}
    />
  );
}
