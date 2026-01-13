/**
 * Dashboard Revamp - TypeScript Type Definitions
 *
 * Types for new dashboard features:
 * - Charts data structures
 * - Notifications
 * - User achievements
 * - Progress tracking
 */

// ============================================================================
// CHARTS DATA TYPES
// ============================================================================

/**
 * Status Timeline Chart - Active cereri with progress
 */
export interface CerereTimeline {
  id: string;
  numar_cerere: string;
  tip_cerere: {
    nume: string;
  };
  status: string;
  progress: CerereProgress;
  created_at: string;
  updated_at: string;
}

export interface CerereProgress {
  percentage: number; // 0-100
  current_step: string; // status value
  eta_days: number | null; // estimated days remaining
  last_activity: string | null; // ISO timestamp
  timeline?: TimelineEvent[]; // optional detailed timeline
}

export interface TimelineEvent {
  status: string;
  timestamp: string;
  actor: string; // who made the change
  note?: string;
}

/**
 * Plăți Monthly Chart - Aggregated payments by month
 */
export interface MonthlyPaymentData {
  monthly: MonthlyPayment[];
  summary: PaymentSummary;
}

export interface MonthlyPayment {
  month: string; // YYYY-MM
  month_label: string; // Ian 2025
  total_suma: number;
  total_plati: number;
  success_count: number;
  pending_count: number;
  success_suma: number; // suma plăților procesate
  pending_suma: number; // suma plăților în așteptare
}

export interface PaymentSummary {
  total_year: number;
  total_month_current: number;
  upcoming_payments: number;
}

/**
 * Service Breakdown Chart - Cereri by type
 */
export interface ServiceBreakdownData {
  breakdown: ServiceBreakdownItem[];
  total: number;
}

export interface ServiceBreakdownItem {
  tip_cerere_id: string;
  tip_cerere_nume: string;
  categorie: string;
  count: number;
  percentage: number;
  color: string; // hex color for chart
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export interface Notification {
  id: string;
  utilizator_id: string;
  primarie_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  dismissed_at: string | null;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  expires_at: string | null;
}

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

/**
 * Client-side notification with display helpers
 */
export interface NotificationDisplay extends Notification {
  icon: string; // icon name
  color: string; // color class
  canDismiss: boolean;
  isExpired: boolean;
}

// ============================================================================
// USER ACHIEVEMENTS (GAMIFICATION)
// ============================================================================

export interface UserAchievement {
  id: string;
  utilizator_id: string;
  achievement_key: AchievementKey;
  points: number;
  progress: number; // 0-100
  unlocked_at: string | null;
  metadata: Record<string, unknown>;
}

export type AchievementKey =
  | "first_cerere"
  | "payment_on_time"
  | "expert_autorizatii"
  | "organized_documents"
  | "fast_responder"
  | "all_payments_current"
  | "power_user"
  | "early_adopter";

/**
 * Achievement definition with display info
 */
export interface Achievement {
  key: AchievementKey;
  title: string;
  description: string;
  icon: string;
  points: number;
  criteria: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
}

/**
 * User's achievement progress
 */
export interface AchievementProgress {
  achievement: Achievement;
  current: number;
  target: number;
  percentage: number;
  unlocked: boolean;
  unlocked_at: string | null;
}

// ============================================================================
// NEXT STEPS RECOMMENDATIONS
// ============================================================================

export interface NextStep {
  id: string;
  type: NextStepType;
  priority: number; // 1-5, 1 is highest
  title: string;
  description: string;
  action_url: string;
  action_label: string;
  deadline?: string | null;
  metadata?: Record<string, unknown>;
}

export type NextStepType =
  | "complete_draft"
  | "upload_documents"
  | "pay_pending"
  | "download_approved"
  | "provide_feedback"
  | "review_status"
  | "action_required";

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

export interface DashboardApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Combined dashboard data response
 */
export interface DashboardData {
  timeline: CerereTimeline[];
  payments: MonthlyPaymentData;
  breakdown: ServiceBreakdownData;
  notifications: Notification[];
  nextSteps: NextStep[];
  achievements?: UserAchievement[];
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

/**
 * Props for StatusTimelineChart component
 */
export interface StatusTimelineChartProps {
  data: CerereTimeline[];
  isLoading?: boolean;
  onCerereClick?: (cerereId: string) => void;
}

/**
 * Props for PlatiOverviewChart component
 */
export interface PlatiOverviewChartProps {
  data: MonthlyPaymentData;
  isLoading?: boolean;
  months?: number;
}

/**
 * Props for ServiceBreakdownChart component
 */
export interface ServiceBreakdownChartProps {
  data: ServiceBreakdownData;
  isLoading?: boolean;
  onSegmentClick?: (tipCerereId: string) => void;
}

/**
 * Props for SmartNotificationsBanner component
 */
export interface SmartNotificationsBannerProps {
  notifications: Notification[];
  onDismiss: (notificationId: string) => void;
  onAction: (notificationId: string, actionUrl: string) => void;
}

/**
 * Props for NextStepsWidget component
 */
export interface NextStepsWidgetProps {
  steps: NextStep[];
  maxDisplay?: number;
  onStepClick?: (step: NextStep) => void;
  onDismiss?: (stepId: string) => void;
}

/**
 * Props for ActiveRequestProgressCard component
 */
export interface ActiveRequestProgressCardProps {
  cerere: CerereTimeline;
  onViewDetails?: (cerereId: string) => void;
  onContact?: (cerereId: string) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Chart data point for Recharts
 */
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Filter options for dashboard data
 */
export interface DashboardFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  tipCerere?: string[];
}

/**
 * Dashboard preferences (stored in localStorage)
 */
export interface DashboardPreferences {
  defaultView: "grid" | "list";
  chartType: "bar" | "line" | "area";
  showNotifications: boolean;
  showAchievements: boolean;
  compactMode: boolean;
}
