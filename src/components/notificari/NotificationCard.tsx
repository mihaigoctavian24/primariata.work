"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Notification, NotificationPriority } from "@/types/notifications";
import { NOTIFICATION_CONFIGS } from "@/types/notifications";
import { useState, useEffect } from "react";

interface NotificationCardProps {
  notification: Notification;
  onDismiss?: (id: string) => void;
  onMarkRead?: (id: string) => void;
  onMarkUnread?: (id: string) => void;
  onActionClick?: (url: string) => void;
}

/**
 * Trigger haptic feedback on mobile devices
 */
const triggerHaptic = () => {
  if (typeof window !== "undefined" && "vibrate" in navigator) {
    navigator.vibrate(50);
  }
};

/**
 * Check if device is mobile (touch-based)
 */
const isMobileDevice = () => {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia("(pointer: coarse)").matches
  );
};

/**
 * NotificationCard Component
 *
 * Single notification card with:
 * - Priority badge with theme-adaptive colors
 * - Full message text (NOT truncated)
 * - Action URL button (if available)
 * - Dismiss and mark read/unread actions
 * - Framer Motion animations
 * - Unread indicator dot
 * - Mobile swipe gestures (swipe left = dismiss, swipe right = mark read)
 */
export function NotificationCard({
  notification,
  onDismiss,
  onMarkRead,
  onMarkUnread,
  onActionClick,
}: NotificationCardProps) {
  const config = NOTIFICATION_CONFIGS[notification.type];
  const Icon = config.icon;
  const isUnread = !notification.read_at;

  // Mobile swipe gesture state
  const [isMobile, setIsMobile] = useState(false);
  const x = useMotionValue(0);

  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileDevice());
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Swipe gesture configuration
  const SWIPE_THRESHOLD = 50; // Minimum pixels to trigger action
  const SWIPE_MAX = 100; // Maximum drag distance

  // Background gradient based on swipe direction
  const xInput = [-SWIPE_MAX, 0, SWIPE_MAX];
  const background = useTransform(x, xInput, [
    "linear-gradient(90deg, transparent 0%, rgba(220, 38, 38, 0.3) 100%)", // Red for dismiss
    "transparent",
    "linear-gradient(90deg, rgba(34, 197, 94, 0.3) 0%, transparent 100%)", // Green for mark read
  ]);

  // Icon opacity for swipe indicators
  const leftIconOpacity = useTransform(x, [-SWIPE_MAX, -SWIPE_THRESHOLD, 0], [1, 0.5, 0]);
  const rightIconOpacity = useTransform(x, [0, SWIPE_THRESHOLD, SWIPE_MAX], [0, 0.5, 1]);

  /**
   * Handle swipe gesture end
   */
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;

    // Swipe LEFT (dismiss)
    if (offset < -SWIPE_THRESHOLD && onDismiss) {
      triggerHaptic();
      onDismiss(notification.id);
      return;
    }

    // Swipe RIGHT (mark read/unread)
    if (offset > SWIPE_THRESHOLD) {
      triggerHaptic();
      if (isUnread && onMarkRead) {
        onMarkRead(notification.id);
      } else if (!isUnread && onMarkUnread) {
        onMarkUnread(notification.id);
      }
      return;
    }

    // Reset position if threshold not met
    x.set(0);
  };

  // Priority colors for unread dot indicator (from SmartNotificationsBanner)
  const priorityColors: Record<NotificationPriority, string> = {
    urgent: "bg-[#be3144]",
    high: "bg-orange-500",
    medium: "bg-blue-500",
    low: "bg-gray-400",
  };

  // Priority badges with theme-adaptive colors (STRICT pattern)
  const priorityBadges: Record<NotificationPriority, { label: string; className: string }> = {
    urgent: {
      label: "Urgent",
      className: "bg-[#be3144]/10 text-[#be3144] border-0",
    },
    high: {
      label: "Prioritate Înaltă",
      className: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-0",
    },
    medium: {
      label: "Prioritate Medie",
      className: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0",
    },
    low: {
      label: "Prioritate Scăzută",
      className: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-0",
    },
  };

  const priorityBadge = priorityBadges[notification.priority];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="relative"
    >
      {/* Swipe indicators (mobile only) */}
      {isMobile && (
        <>
          {/* Left indicator - Dismiss (X icon) */}
          <motion.div
            className="pointer-events-none absolute top-1/2 left-4 z-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-red-500"
            style={{ opacity: leftIconOpacity }}
          >
            <X className="h-5 w-5 text-white" />
          </motion.div>

          {/* Right indicator - Mark Read (Check icon) */}
          <motion.div
            className="pointer-events-none absolute top-1/2 right-4 z-0 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-green-500"
            style={{ opacity: rightIconOpacity }}
          >
            <Check className="h-5 w-5 text-white" />
          </motion.div>
        </>
      )}

      {/* Swipeable card wrapper (mobile only) */}
      <motion.div
        drag={isMobile && !prefersReducedMotion ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={isMobile && !prefersReducedMotion ? handleDragEnd : undefined}
        style={{ x: isMobile && !prefersReducedMotion ? x : 0 }}
        className="relative z-10"
      >
        {/* Background gradient overlay for swipe feedback (mobile only) */}
        {isMobile && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-lg"
            style={{ background }}
          />
        )}

        <Card
          className={cn(
            "group relative overflow-hidden transition-all hover:shadow-lg",
            "bg-card border-border/50",
            isUnread && "border-primary/20",
            isMobile && "touch-pan-y" // Prevent horizontal scroll on mobile
          )}
        >
          <CardContent className="p-4">
            {/* Header: Icon + Title + Priority Badge + Unread Dot */}
            <div className="flex items-start gap-3">
              {/* Icon (brand red) */}
              <div className="flex-shrink-0">
                <Icon className="h-5 w-5 text-[#be3144]" />
              </div>

              {/* Title + Badges */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      "truncate text-sm font-semibold",
                      isUnread ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {notification.title}
                  </h4>
                  {/* Unread indicator dot */}
                  {isUnread && (
                    <span
                      className={cn(
                        "h-2 w-2 flex-shrink-0 rounded-full shadow-lg",
                        priorityColors[notification.priority]
                      )}
                    />
                  )}
                </div>

                {/* Priority Badge */}
                <Badge variant="outline" className={priorityBadge.className}>
                  {priorityBadge.label}
                </Badge>
              </div>

              {/* Dismiss Button (X icon) */}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDismiss(notification.id)}
                  className={cn(
                    "flex-shrink-0 transition-opacity",
                    isMobile
                      ? "h-11 w-11 opacity-100" // Mobile: larger touch target (44x44px), always visible
                      : "h-8 w-8 opacity-0 group-hover:opacity-100" // Desktop: hover-reveal
                  )}
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Message - Full text visible (NOT truncated) */}
            <p className="text-muted-foreground mt-2 text-sm">{notification.message}</p>

            {/* Footer: Timestamp + Actions */}
            <div className="mt-3 flex items-center justify-between gap-3">
              {/* Timestamp (relative with Romanian locale) */}
              <span className="text-muted-foreground text-xs">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ro,
                })}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Action URL Button */}
                {notification.action_url && notification.action_label && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-[#be3144] hover:underline"
                    onClick={() =>
                      onActionClick
                        ? onActionClick(notification.action_url!)
                        : window.open(notification.action_url!, "_blank", "noopener,noreferrer")
                    }
                  >
                    {notification.action_label}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                )}

                {/* Mark Read/Unread Toggle */}
                {(onMarkRead || onMarkUnread) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      isUnread ? onMarkRead?.(notification.id) : onMarkUnread?.(notification.id)
                    }
                    className={cn(
                      "text-xs",
                      isMobile ? "h-11 px-3" : "h-auto p-0" // Mobile: larger touch target
                    )}
                  >
                    <Check className="mr-1.5 h-3 w-3" />
                    {isUnread ? "Marchează citit" : "Marchează necitit"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>

          {/* Subtle gradient overlay on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </Card>
      </motion.div>
    </motion.div>
  );
}

/**
 * NotificationCardSkeleton Component
 * Loading skeleton for notification card
 */
export function NotificationCardSkeleton() {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
