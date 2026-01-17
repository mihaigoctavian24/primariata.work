"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, ChevronDown } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  type Notification,
  type NotificationPriority,
  NOTIFICATION_CONFIGS,
} from "@/types/notifications";

interface SmartNotificationsBannerProps {
  notifications: Notification[];
  onDismiss: (notificationId: string) => void;
  onAction: (notificationId: string, actionUrl: string) => void;
  maxDisplay?: number;
}

/**
 * Smart Notifications Banner - Floating Pills Design
 *
 * Elegant notification system with:
 * - Minimal collapsed header with badge
 * - Floating pill-style notifications
 * - Priority-based color coding using theme colors
 * - Smooth animations and transitions
 */
export function SmartNotificationsBanner({
  notifications,
  onDismiss,
  onAction,
  maxDisplay = 5,
}: SmartNotificationsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [firstName, setFirstName] = useState<string>("");

  // Get user's first name
  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.user_metadata?.full_name) {
        // Extract first name from full name
        const fullName = user.user_metadata.full_name as string;
        const firstNameExtracted = fullName.split(" ")[0] || "";
        setFirstName(firstNameExtracted);
      }
    };

    fetchUser();
  }, []);

  // Filter active notifications (not dismissed, not expired)
  const activeNotifications = notifications.filter((n) => !n.dismissed_at);
  const unreadCount = activeNotifications.filter((n) => !n.read_at).length;

  // Group notifications by priority for display
  const priorityGroups = activeNotifications.reduce(
    (acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    },
    {} as Record<NotificationPriority, number>
  );

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Bună dimineața";
    } else if (hour >= 12 && hour < 18) {
      return "Bună ziua";
    } else {
      return "Bună seara";
    }
  };

  // Create descriptive text with colored badges
  const getNotificationSummary = () => {
    const parts: Array<{ text: string; priority: NotificationPriority }> = [];

    // Grammatically correct forms based on quantity
    if (priorityGroups.urgent) {
      const count = priorityGroups.urgent;
      parts.push({
        text: count === 1 ? `${count} urgent` : `${count} urgente`,
        priority: "urgent",
      });
    }
    if (priorityGroups.high) {
      const count = priorityGroups.high;
      parts.push({
        text: `${count} prioritate înaltă`,
        priority: "high",
      });
    }
    if (priorityGroups.medium) {
      const count = priorityGroups.medium;
      parts.push({
        text: count === 1 ? `${count} medie` : `${count} medii`,
        priority: "medium",
      });
    }
    if (priorityGroups.low) {
      const count = priorityGroups.low;
      parts.push({
        text: count === 1 ? `${count} scăzută` : `${count} scăzute`,
        priority: "low",
      });
    }

    if (parts.length === 0) {
      return <span>Nicio notificare</span>;
    }

    // Get current date in Romanian format
    const today = format(new Date(), "d MMMM yyyy", { locale: ro });

    // Time-based personalized greeting
    const timeGreeting = getTimeBasedGreeting();
    const greeting = firstName ? `${timeGreeting} ${firstName}` : timeGreeting;

    // Total notifications count
    const totalCount = activeNotifications.length;
    const notificationWord = totalCount === 1 ? "notificare" : "notificări";

    return (
      <span className="text-foreground flex flex-wrap items-center gap-1">
        <span>
          {greeting}, astăzi <span className="font-semibold">{today}</span> aveți{" "}
          {totalCount === 1 ? "următoarea" : "următoarele"} {notificationWord}:
        </span>
        {parts.map((part, index) => (
          <span key={part.priority} className="inline-flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${getPriorityColor(part.priority)}`} />
            <span>{part.text}</span>
            {index < parts.length - 1 && <span className="mx-0.5">,</span>}
          </span>
        ))}
      </span>
    );
  };

  const priorityOrder: Record<NotificationPriority, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  };

  const sortedNotifications = [...activeNotifications].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const visibleNotifications = isExpanded
    ? sortedNotifications
    : sortedNotifications.slice(0, maxDisplay);

  const handleDismiss = (notificationId: string) => {
    onDismiss(notificationId);
  };

  // Unified gray styling for all pills - same as dashboard cards
  const getPriorityStyles = () => {
    return "bg-card border-border/50 hover:bg-muted/50";
  };

  // All icons use the same red color as action links
  const getIconColor = () => {
    return "text-[#be3144]";
  };

  // Priority colors for visual coding
  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case "urgent":
        return "bg-[#be3144]"; // Red
      case "high":
        return "bg-orange-500"; // Orange
      case "medium":
        return "bg-blue-500"; // Blue
      case "low":
        return "bg-gray-400"; // Gray
    }
  };

  if (activeNotifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Minimal Header - Collapsed State */}
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="group bg-card/50 flex w-full items-center justify-between rounded-2xl px-4 py-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              animate={
                unreadCount > 0
                  ? {
                      rotate: [0, -15, 15, -10, 10, -5, 5, 0],
                    }
                  : {}
              }
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut",
              }}
            >
              <Bell className="text-primary h-5 w-5" />
            </motion.div>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#be3144] text-[10px] font-bold text-white shadow-lg"
              >
                {unreadCount}
              </motion.span>
            )}
          </div>
          <span className="text-foreground text-sm font-medium">{getNotificationSummary()}</span>
        </div>

        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="text-muted-foreground group-hover:text-foreground h-4 w-4 transition-colors" />
        </motion.div>
      </motion.button>

      {/* Floating Pills - Expanded State */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <div className="space-y-2">
            {visibleNotifications.map((notification, index) => {
              const config = NOTIFICATION_CONFIGS[notification.type];
              const isUnread = !notification.read_at;
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                  className="overflow-hidden rounded-2xl"
                >
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{
                      duration: 0.15,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className={`group relative overflow-hidden rounded-2xl border shadow-lg transition-all hover:shadow-xl ${getPriorityStyles()}`}
                  >
                    {/* Floating Pill Content */}
                    <div className="flex items-center gap-3 p-4">
                      {/* Icon in Red */}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${getIconColor()}`}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <h4
                            className={`truncate text-sm font-semibold ${isUnread ? "text-foreground" : "text-muted-foreground"}`}
                          >
                            {notification.title}
                          </h4>
                          {isUnread && (
                            <span
                              className={`h-2 w-2 flex-shrink-0 rounded-full shadow-lg ${getPriorityColor(notification.priority)}`}
                            />
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 text-sm">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3 pt-1">
                          {notification.action_url && notification.action_label && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAction(notification.id, notification.action_url!);
                              }}
                              className="text-xs font-medium text-[#be3144] transition-colors hover:underline"
                            >
                              {notification.action_label} →
                            </button>
                          )}
                          <span className="text-muted-foreground text-[10px]">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ro,
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Dismiss Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDismiss(notification.id);
                        }}
                        className="h-8 w-8 flex-shrink-0 rounded-xl p-0 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Subtle gradient overlay */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
