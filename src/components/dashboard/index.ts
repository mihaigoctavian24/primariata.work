// Dashboard Components
export { MetricCard, type MetricCardProps } from "./MetricCard";
export {
  InteractiveChart,
  type InteractiveChartProps,
  type ChartType,
  type ChartDataPoint,
} from "./InteractiveChart";
export { DataTable, type DataTableProps, type Column } from "./DataTable";
export { FilterPanel, type FilterPanelProps, type FilterOption } from "./FilterPanel";
export {
  ExportDialog,
  type ExportDialogProps,
  type ExportFormat,
  type ExportOptions,
} from "./ExportDialog";
export { DateRangePicker, type DateRangePickerProps, type DateRange } from "./DateRangePicker";
export { SearchBar, type SearchBarProps } from "./SearchBar";
export { BulkActionsToolbar, type BulkActionsToolbarProps } from "./BulkActionsToolbar";
export { ConfirmDialog, type ConfirmDialogProps } from "./ConfirmDialog";

// Skeleton Components
export { StatsSkeleton, type StatsSkeletonProps } from "./StatsSkeleton";
export { ChartSkeleton, type ChartSkeletonProps } from "./ChartSkeleton";
export { TableSkeleton, type TableSkeletonProps } from "./TableSkeleton";

// Phase 5 Skeleton Components
export {
  CitizenBadgeSkeleton,
  type CitizenBadgeSkeletonProps,
  HelpCenterSkeleton,
  type HelpCenterSkeletonProps,
  DashboardCalendarSkeleton,
  type DashboardCalendarSkeletonProps,
} from "./Phase5Skeleton";

// Dashboard Revamp Components (Phase 1 & 2)
export { StatusTimelineChart } from "./charts/StatusTimelineChart";
export { PlatiOverviewChart } from "./charts/PlatiOverviewChart";
export { ServiceBreakdownChart } from "./charts/ServiceBreakdownChart";
export { SmartNotificationsBanner } from "./SmartNotificationsBanner";
export { NextStepsWidget } from "./NextStepsWidget";
export { ActiveRequestProgressCard } from "./ActiveRequestProgressCard";

// Dashboard Revamp Components (Phase 3)
export { GlobalSearchBar } from "./GlobalSearchBar";

// NOTE: DocumentQuickPreview MUST be dynamically imported with ssr: false
// Cannot export from barrel file due to react-pdf's browser-only dependencies
// Usage: const DocumentQuickPreview = dynamic(() => import("@/components/dashboard/DocumentQuickPreview").then(mod => ({ default: mod.DocumentQuickPreview })), { ssr: false });
export { RecentDocumentsWidget } from "./RecentDocumentsWidget";

// Dashboard Revamp Components (Phase 5: Tier 2 Features)
export { HelpCenterWidget } from "./HelpCenterWidget";
export { CitizenBadgeWidget } from "./CitizenBadgeWidget";
export { DashboardCalendar } from "./DashboardCalendar";
export { WeatherWidget } from "./WeatherWidget";
// Note: ComparisonStats integrated into StatisticsCards (no separate export)

// Error Handling
export { ErrorBoundary, ErrorFallback, InlineError } from "./ErrorBoundary";
