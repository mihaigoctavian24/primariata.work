import { z } from "zod";
import { createSafeStringSchema, uuidSchema } from "./common";

/**
 * Notifications Validation Schemas
 *
 * SECURITY ENHANCEMENTS:
 * - String length limits to prevent DoS
 * - XSS sanitization for user input
 * - Pagination bounds validation
 *
 * FEATURES:
 * - Comprehensive filtering (type, priority, status, search)
 * - Pagination with bounds (max 100 per page)
 * - Batch operations (mark all as read)
 * - Individual actions (mark read/unread, dismiss)
 */

/**
 * Notification Type Enum
 * Represents different categories of notifications
 * Matches database schema types from notifications table
 */
export const NotificationType = {
  PAYMENT_DUE: "payment_due",
  CERERE_APPROVED: "cerere_approved",
  CERERE_REJECTED: "cerere_rejected",
  DOCUMENT_MISSING: "document_missing",
  DOCUMENT_UPLOADED: "document_uploaded",
  STATUS_UPDATED: "status_updated",
  DEADLINE_APPROACHING: "deadline_approaching",
  ACTION_REQUIRED: "action_required",
  INFO: "info",
} as const;

export type NotificationTypeEnum = (typeof NotificationType)[keyof typeof NotificationType];

/**
 * Notification Priority Enum
 * Determines urgency and visual treatment
 */
export const NotificationPriority = {
  URGENT: "urgent",
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
} as const;

export type NotificationPriorityEnum =
  (typeof NotificationPriority)[keyof typeof NotificationPriority];

/**
 * Notification Status Enum
 * Tracks read state and dismissal
 */
export const NotificationStatus = {
  UNREAD: "unread",
  READ: "read",
  DISMISSED: "dismissed",
} as const;

export type NotificationStatusEnum = (typeof NotificationStatus)[keyof typeof NotificationStatus];

/**
 * List Notifications Query Schema
 * Validates query parameters for notification listing
 *
 * SECURITY: Pagination bounds, search length limits
 * FEATURES: Full filtering (type, priority, status, tab, search)
 */
export const listNotificationsQuerySchema = z.object({
  // Pagination
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 10000, "Page must be between 1 and 10000"),

  limit: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "Limit must be between 1 and 100"),

  // Filters
  type: z.nativeEnum(NotificationType).optional(),

  priority: z.nativeEnum(NotificationPriority).optional(),

  status: z.nativeEnum(NotificationStatus).optional(),

  // Tab filter (combines status logic)
  // "toate" = all, "urgente" = urgent priority, "arhiva" = archived status
  tab: z.enum(["toate", "urgente", "arhiva"]).optional(),

  // Full-text search (searches title and message)
  search: createSafeStringSchema({
    maxLength: 200,
    sanitize: true,
    allowEmpty: true,
  }),

  // Sorting
  sort: z.enum(["created_at", "updated_at", "priority"]).optional().default("created_at"),

  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>;

/**
 * Mark All As Read Schema
 * Validates batch operation to mark all unread notifications as read
 *
 * Optional filter to mark only specific types/priorities
 */
export const markAllAsReadSchema = z.object({
  // Optional filters to limit which notifications get marked
  type: z.nativeEnum(NotificationType).optional(),
  priority: z.nativeEnum(NotificationPriority).optional(),

  // Confirmation flag (UI can require explicit confirmation)
  confirm: z.boolean().optional(),
});

export type MarkAllAsReadData = z.infer<typeof markAllAsReadSchema>;

/**
 * Update Notification Schema
 * Validates individual notification actions
 *
 * ACTIONS:
 * - "read" = mark as read
 * - "unread" = mark as unread
 * - "archive" = archive notification
 * - "dismiss" = soft delete (archive)
 */
export const updateNotificationSchema = z.object({
  action: z.enum(["read", "unread", "archive", "dismiss"]),
});

export type UpdateNotificationData = z.infer<typeof updateNotificationSchema>;

/**
 * Notification Response Schema (for type safety)
 * Represents a notification object returned by the API
 */
export const notificationResponseSchema = z.object({
  id: uuidSchema,
  user_id: uuidSchema,
  type: z.nativeEnum(NotificationType),
  priority: z.nativeEnum(NotificationPriority),
  title: z.string(),
  message: z.string(),
  action_url: z.string().nullable(),
  metadata: z.object({}).passthrough().nullable(),
  read_at: z.string().nullable(), // ISO timestamp
  archived_at: z.string().nullable(), // ISO timestamp
  created_at: z.string(), // ISO timestamp
  updated_at: z.string(), // ISO timestamp
});

export type NotificationResponse = z.infer<typeof notificationResponseSchema>;

/**
 * Paginated Notifications Response Schema
 */
export const paginatedNotificationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(notificationResponseSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      total_pages: z.number(),
    }),
    unread_count: z.number().optional(), // Total unread count across all pages
  }),
});

export type PaginatedNotificationsResponse = z.infer<typeof paginatedNotificationsResponseSchema>;

/**
 * Get Romanian label for notification type
 */
export function getNotificationTypeLabel(type: NotificationTypeEnum): string {
  const labels: Record<NotificationTypeEnum, string> = {
    [NotificationType.PAYMENT_DUE]: "Plată - Scadență",
    [NotificationType.CERERE_APPROVED]: "Cerere - Aprobată",
    [NotificationType.CERERE_REJECTED]: "Cerere - Respinsă",
    [NotificationType.DOCUMENT_MISSING]: "Document - Lipsește",
    [NotificationType.DOCUMENT_UPLOADED]: "Document - Încărcat",
    [NotificationType.STATUS_UPDATED]: "Status - Actualizat",
    [NotificationType.DEADLINE_APPROACHING]: "Termen - Apropiat",
    [NotificationType.ACTION_REQUIRED]: "Acțiune - Necesară",
    [NotificationType.INFO]: "Informare",
  };

  return labels[type] || type;
}

/**
 * Get Romanian label for notification priority
 */
export function getNotificationPriorityLabel(priority: NotificationPriorityEnum): string {
  const labels: Record<NotificationPriorityEnum, string> = {
    [NotificationPriority.URGENT]: "Urgent",
    [NotificationPriority.HIGH]: "Prioritate Înaltă",
    [NotificationPriority.MEDIUM]: "Prioritate Medie",
    [NotificationPriority.LOW]: "Prioritate Scăzută",
  };

  return labels[priority] || priority;
}

/**
 * Get theme-adaptive color classes for notification priority
 * Uses pattern: bg-{color}-500/10 text-{color}-700 dark:text-{color}-400
 */
export function getNotificationPriorityColor(priority: NotificationPriorityEnum): string {
  const colors: Record<NotificationPriorityEnum, string> = {
    [NotificationPriority.URGENT]: "bg-[#be3144]/10 text-[#be3144] border-0", // Brand red
    [NotificationPriority.HIGH]: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-0",
    [NotificationPriority.MEDIUM]: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-0",
    [NotificationPriority.LOW]: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-0",
  };

  return colors[priority] || "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-0";
}

/**
 * Get icon component for notification type
 * Returns Lucide icon name
 */
export function getNotificationTypeIcon(type: NotificationTypeEnum): string {
  const icons: Record<NotificationTypeEnum, string> = {
    [NotificationType.PAYMENT_DUE]: "CreditCard",
    [NotificationType.CERERE_APPROVED]: "CheckCircle",
    [NotificationType.CERERE_REJECTED]: "XCircle",
    [NotificationType.DOCUMENT_MISSING]: "FileX",
    [NotificationType.DOCUMENT_UPLOADED]: "FileCheck",
    [NotificationType.STATUS_UPDATED]: "RefreshCw",
    [NotificationType.DEADLINE_APPROACHING]: "Clock",
    [NotificationType.ACTION_REQUIRED]: "AlertTriangle",
    [NotificationType.INFO]: "Info",
  };

  return icons[type] || "Bell";
}
