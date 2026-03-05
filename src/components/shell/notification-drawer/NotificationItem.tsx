"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NOTIFICATION_CONFIGS } from "@/types/notifications";
import type { Notification } from "@/types/notifications";

/**
 * NotificationItem
 *
 * Single notification row in the drawer. Shows type-specific icon/color,
 * title, message (truncated 2 lines), relative timestamp, and actions.
 */

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

function formatRelativeTime(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "acum";
  if (diffMin < 60) return `acum ${diffMin} min`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `acum ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `acum ${diffDays}z`;

  return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

export function NotificationItem({ notification, onMarkRead, onDismiss }: NotificationItemProps) {
  const router = useRouter();
  const isUnread = !notification.read_at;
  const config = NOTIFICATION_CONFIGS[notification.type] ?? NOTIFICATION_CONFIGS.info;
  const IconComponent = config.icon;

  function handleClick(): void {
    if (isUnread) {
      onMarkRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  }

  return (
    <div
      className={cn(
        "group hover:bg-muted/50 relative flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors",
        isUnread && "border-l-primary bg-muted/30 border-l-2"
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Type icon */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.bgColor
        )}
      >
        <IconComponent className={cn("h-4 w-4", config.color)} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-tight", isUnread && "font-semibold")}>
            {notification.title}
          </p>
          <span className="text-muted-foreground shrink-0 text-xs">
            {formatRelativeTime(notification.created_at)}
          </span>
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-2 text-xs">{notification.message}</p>

        {/* Actions */}
        <div className="mt-1.5 flex items-center gap-2">
          {isUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-1.5 text-[10px]"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
            >
              Marcheaza citit
            </Button>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        aria-label="Inchide notificarea"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
