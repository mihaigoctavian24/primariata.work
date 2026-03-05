"use client";

import { useRouter } from "next/navigation";
import { Check, Trash2, Clock } from "lucide-react";
import { motion } from "motion/react";
import { NOTIFICATION_CONFIGS } from "@/types/notifications";
import type { Notification, NotificationType } from "@/types/notifications";

/**
 * NotificationItem
 *
 * Animated notification item with color-coded icons via CSS status tokens,
 * unread indicator bar, and hover actions. Uses --nd-* and --status-* tokens.
 */

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}

/** Map notification types to Tailwind status classes for icon + bar */
function getStatusClasses(type: NotificationType | string): {
  iconBg: string;
  iconText: string;
  barBg: string;
} {
  switch (type) {
    case "cerere_approved":
    case "document_uploaded":
      return {
        iconBg: "bg-status-success/15",
        iconText: "text-status-success",
        barBg: "bg-status-success",
      };
    case "cerere_rejected":
    case "deadline_approaching":
    case "document_missing":
      return {
        iconBg: "bg-status-warning/15",
        iconText: "text-status-warning",
        barBg: "bg-status-warning",
      };
    case "status_updated":
    case "cerere_submitted":
    case "info":
      return {
        iconBg: "bg-status-info/15",
        iconText: "text-status-info",
        barBg: "bg-status-info",
      };
    case "action_required":
    case "payment_due":
      return {
        iconBg: "bg-status-action/15",
        iconText: "text-status-action",
        barBg: "bg-status-action",
      };
    default:
      return {
        iconBg: "bg-status-info/15",
        iconText: "text-status-info",
        barBg: "bg-status-info",
      };
  }
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
  const statusClasses = getStatusClasses(notification.type);

  function handleClick(): void {
    if (isUnread) {
      onMarkRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40, height: 0 }}
      className={`group relative mb-2 cursor-pointer rounded-lg border px-4 py-3 transition-colors ${
        isUnread
          ? "border-nd-border-section bg-nd-hover"
          : "border-transparent bg-transparent opacity-60"
      }`}
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
      {/* Unread indicator bar */}
      {isUnread && (
        <div className={`absolute top-3 left-0 h-8 w-1 rounded-r ${statusClasses.barBg}`} />
      )}

      <div className="flex gap-3">
        {/* Icon background */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${statusClasses.iconBg}`}
        >
          <IconComponent className={`h-4 w-4 ${statusClasses.iconText}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className="text-nd-foreground text-[length:var(--font-size-sm)] leading-tight"
            style={{ fontWeight: isUnread ? 500 : 400 }}
          >
            {notification.title}
          </p>
          <p className="text-nd-muted mt-0.5 line-clamp-2 text-[length:var(--font-size-xs)]">
            {notification.message}
          </p>

          {/* Timestamp */}
          <div className="text-nd-dimmed mt-1 flex items-center gap-1 text-[length:0.7rem]">
            <Clock className="h-3 w-3" />
            <span>{formatRelativeTime(notification.created_at)}</span>
          </div>
        </div>

        {/* Hover actions */}
        <div className="flex shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {isUnread && (
            <button
              className="text-nd-muted hover:text-status-success flex h-6 w-6 items-center justify-center rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onMarkRead(notification.id);
              }}
              aria-label="Marcheaza citit"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            className="text-nd-muted hover:text-destructive flex h-6 w-6 items-center justify-center rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss(notification.id);
            }}
            aria-label="Inchide notificarea"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
