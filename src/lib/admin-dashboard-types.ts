/**
 * Admin Dashboard Data Types
 *
 * Shared TypeScript interfaces for all admin dashboard sections.
 * Used by both server-side query functions and client-side components.
 */

export interface UserStatsData {
  cetateni: { count: number; trend: { value: number; isPositive: boolean } };
  functionari: { count: number; trend: { value: number; isPositive: boolean } };
  primar: { count: number };
  admini: { count: number };
  pending: { count: number; trend: { value: number; isPositive: boolean } };
}

export interface CereriOverviewItem {
  status: string;
  label: string;
  count: number;
  color: string;
}

export interface HealthMetricsData {
  dbLoad: { value: number; max: number };
  storage: { usedBytes: number; label: string };
  apiResponse: { avgMs: number };
  activeSessions: { count: number };
}

export interface FunctionarPerformance {
  id: string;
  name: string;
  initials: string;
  cereriResolved: number;
  resolutionRate: number;
  isOnline: boolean;
}

export interface AdminAlert {
  id: string;
  title: string;
  description: string;
  severity: "urgent" | "warning" | "info" | "system";
  actionLabel: string;
  actionHref: string;
  count?: number;
}

export interface ActivityDataPoint {
  date: string;
  value: number;
}

export interface WelcomeBannerData {
  adminName: string;
  primarieName: string;
  judetName: string;
  uptimePercent: number;
  cereriResolutionPercent: number;
  slaCompliancePercent: number;
  pendingRegistrations: number;
  onlineFunctionari: number;
  alertCount: number;
}

export interface DashboardData {
  welcome: WelcomeBannerData;
  userStats: UserStatsData;
  cereriOverview: CereriOverviewItem[];
  healthMetrics: HealthMetricsData;
  performance: FunctionarPerformance[];
  alerts: AdminAlert[];
  activityData: ActivityDataPoint[];
}
