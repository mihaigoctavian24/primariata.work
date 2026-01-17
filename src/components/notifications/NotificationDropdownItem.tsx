"use client";

import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import { NOTIFICATION_CONFIGS } from "@/types/notifications";
import type { Notification } from "@/types/notifications";

interface NotificationDropdownItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
}

/**
 * Individual notification item for dropdown
 *
 * Features:
 * - Icon from notification type config
 * - Title (truncated to 1 line) + Message (truncated to 2 lines)
 * - Timestamp in Romanian relative format
 * - Actions: Mark as read (if unread), Dismiss
 * - Visual indicators: Unread background, hover effects
 * - Accessible: min 44x44px touch targets, semantic HTML
 */
export function NotificationDropdownItem({
  notification,
  onDismiss,
  onMarkRead,
}: NotificationDropdownItemProps) {
  const config = NOTIFICATION_CONFIGS[notification.type];
  const IconComponent = config.icon;
  const isUnread = !notification.read_at;
  // Check urgency for future styling
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _isUrgent = notification.priority === "urgent" || notification.priority === "high";

  return (
    <div
      className={`group relative flex items-start gap-3 overflow-hidden rounded-lg p-4 transition-all hover:bg-orange-500/10 hover:shadow-md ${
        isUnread ? "bg-primary/5" : ""
      }`}
    >
      {/* Orange bar - shows ONLY on hover for ALL notifications */}
      <div className="absolute top-0 left-0 h-full w-1 rounded-l-lg bg-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.color}`}
      >
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        {/* Title with unread indicator */}
        <div className="flex items-center gap-2">
          <h4
            className={`line-clamp-1 text-sm font-semibold ${
              isUnread ? "text-foreground" : "text-muted-foreground"
            }`}
            title={notification.title}
          >
            {notification.title}
          </h4>
          {isUnread && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#be3144]" />}
        </div>

        {/* Message */}
        <p className="text-muted-foreground line-clamp-2 text-sm" title={notification.message}>
          {notification.message}
        </p>

        {/* Timestamp */}
        <p className="text-muted-foreground text-xs">
          {formatDistanceToNow(new Date(notification.created_at), {
            addSuffix: true,
            locale: ro,
          })}
        </p>
      </div>

      {/* Actions - visible on hover or always on mobile */}
      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100 lg:opacity-0">
        {/* Mark as read button - only show if unread */}
        {isUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="h-11 w-11 rounded-xl p-0"
            title="Marchează ca citit"
            aria-label="Marchează ca citit"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}

        {/* Dismiss button - always show */}
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className="h-11 w-11 rounded-xl p-0"
          title="Respinge notificarea"
          aria-label="Respinge notificarea"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Gradient overlay for modern hover effect */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
