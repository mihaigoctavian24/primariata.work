/**
 * Notification types and interfaces
 * Based on database schema from migration 20260109003629_dashboard_revamp_tables.sql
 */

import {
  LucideIcon,
  CreditCard,
  CheckCircle,
  XCircle,
  FileX,
  FileCheck,
  RefreshCw,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";

export type NotificationType =
  | "payment_due"
  | "cerere_approved"
  | "cerere_rejected"
  | "document_missing"
  | "document_uploaded"
  | "status_updated"
  | "deadline_approaching"
  | "action_required"
  | "info";

export type NotificationPriority = "urgent" | "high" | "medium" | "low";

export interface Notification {
  id: string;
  utilizator_id: string;
  primarie_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url?: string | null;
  action_label?: string | null;
  dismissed_at?: string | null;
  read_at?: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  expires_at?: string | null;
}

export interface NotificationResponse {
  data: Notification[];
  count: number;
  unread_count: number;
}

export interface NotificationAction {
  label: string;
  url: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export interface NotificationConfig {
  type: NotificationType;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

// Notification type configurations for UI
export const NOTIFICATION_CONFIGS: Record<NotificationType, NotificationConfig> = {
  payment_due: {
    type: "payment_due",
    icon: CreditCard,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  cerere_approved: {
    type: "cerere_approved",
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  cerere_rejected: {
    type: "cerere_rejected",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  document_missing: {
    type: "document_missing",
    icon: FileX,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  document_uploaded: {
    type: "document_uploaded",
    icon: FileCheck,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  status_updated: {
    type: "status_updated",
    icon: RefreshCw,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  deadline_approaching: {
    type: "deadline_approaching",
    icon: Clock,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
  action_required: {
    type: "action_required",
    icon: AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
  },
  info: {
    type: "info",
    icon: Info,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
  },
};

// Priority badges
export const PRIORITY_BADGES: Record<NotificationPriority, { label: string; className: string }> = {
  urgent: {
    label: "Urgent",
    className: "bg-red-100 text-red-800 border-red-200",
  },
  high: {
    label: "Prioritate Înaltă",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  medium: {
    label: "Prioritate Medie",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  low: {
    label: "Prioritate Scăzută",
    className: "bg-gray-100 text-gray-800 border-gray-200",
  },
};
