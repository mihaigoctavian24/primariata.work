"use client";

/**
 * Phase 5 Widget Skeleton Components
 *
 * Skeleton loading states for Phase 5 Tier 2 widgets:
 * - CitizenBadgeWidget (compact & full modes)
 * - HelpCenterWidget
 * - DashboardCalendar
 */

// ─────────────────────────────────────────────────────────────────────────────
// CitizenBadge Skeleton
// ─────────────────────────────────────────────────────────────────────────────

export interface CitizenBadgeSkeletonProps {
  /** Compact mode - shows only current level */
  compact?: boolean;
}

export function CitizenBadgeSkeleton({ compact = false }: CitizenBadgeSkeletonProps) {
  if (compact) {
    return (
      <div className="border-border from-primary/5 to-primary/10 animate-pulse rounded-lg border bg-gradient-to-br p-4">
        <div className="flex items-center gap-3">
          {/* Level icon skeleton */}
          <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full" />

          <div className="flex-1">
            {/* Title skeleton */}
            <div className="mb-2 flex items-center gap-2">
              <div className="bg-muted h-4 w-16 rounded" />
              <div className="bg-muted h-3 w-24 rounded" />
            </div>
            {/* Progress bar skeleton */}
            <div className="mt-1 flex items-center gap-2">
              <div className="bg-muted h-1.5 flex-1 rounded-full" />
              <div className="bg-muted h-3 w-12 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full mode skeleton
  return (
    <div className="border-border bg-card animate-pulse overflow-hidden rounded-lg border shadow-sm">
      {/* Header skeleton */}
      <div className="border-border from-primary/10 to-primary/5 border-b bg-gradient-to-br p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-14 w-14 items-center justify-center rounded-full" />
            <div>
              <div className="bg-muted mb-2 h-5 w-20 rounded" />
              <div className="bg-muted h-4 w-32 rounded" />
            </div>
          </div>
          <div className="text-right">
            <div className="bg-muted mb-1 h-8 w-16 rounded" />
            <div className="bg-muted h-3 w-20 rounded" />
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="bg-muted h-3 w-32 rounded" />
            <div className="bg-muted h-3 w-8 rounded" />
          </div>
          <div className="bg-muted h-2 w-full rounded-full" />
          <div className="bg-muted mt-1 h-3 w-48 rounded" />
        </div>
      </div>

      {/* Achievements skeleton */}
      <div className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="bg-muted h-4 w-20 rounded" />
          <div className="bg-muted h-3 w-16 rounded" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-muted/30 flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="bg-muted h-10 w-10 flex-shrink-0 rounded-full" />
              <div className="flex-1">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="bg-muted mb-1 h-4 w-32 rounded" />
                    <div className="bg-muted h-3 w-48 rounded" />
                  </div>
                </div>
                <div className="bg-muted mt-2 h-1 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="border-border bg-muted/30 border-t p-3">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-4 w-4 rounded" />
          <div className="bg-muted h-3 flex-1 rounded" />
        </div>
      </div>
    </div>
  );
}

CitizenBadgeSkeleton.displayName = "CitizenBadgeSkeleton";

// ─────────────────────────────────────────────────────────────────────────────
// HelpCenter Skeleton
// ─────────────────────────────────────────────────────────────────────────────

export interface HelpCenterSkeletonProps {
  /** Number of FAQ items to show */
  maxFAQs?: number;
}

export function HelpCenterSkeleton({ maxFAQs = 4 }: HelpCenterSkeletonProps) {
  return (
    <div className="border-border bg-card animate-pulse overflow-hidden rounded-lg border shadow-sm">
      {/* Header skeleton */}
      <div className="border-border bg-muted/30 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-9 w-9 rounded-md" />
          <div>
            <div className="bg-muted mb-1 h-4 w-24 rounded" />
            <div className="bg-muted h-3 w-40 rounded" />
          </div>
        </div>
      </div>

      {/* Search bar skeleton */}
      <div className="border-border border-b p-3">
        <div className="bg-muted h-9 w-full rounded-md" />
      </div>

      {/* FAQ list skeleton */}
      <div className="max-h-[400px] overflow-y-auto">
        <div className="divide-border divide-y">
          {Array.from({ length: maxFAQs }).map((_, i) => (
            <div key={i} className="p-3">
              <div className="flex items-start gap-3">
                <div className="bg-muted mt-0.5 h-7 w-7 flex-shrink-0 rounded-md" />
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="bg-muted h-4 w-full rounded" />
                    <div className="bg-muted h-4 w-4 flex-shrink-0 rounded" />
                  </div>
                  <div className="bg-muted h-5 w-16 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="border-border bg-muted/30 border-t p-3">
        <div className="bg-muted h-9 w-full rounded-md" />
      </div>
    </div>
  );
}

HelpCenterSkeleton.displayName = "HelpCenterSkeleton";

// ─────────────────────────────────────────────────────────────────────────────
// DashboardCalendar Skeleton
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardCalendarSkeletonProps {
  /** Whether to show upcoming events section */
  showUpcoming?: boolean;
}

export function DashboardCalendarSkeleton({ showUpcoming = true }: DashboardCalendarSkeletonProps) {
  return (
    <div className="border-border bg-card animate-pulse overflow-hidden rounded-lg border shadow-sm">
      {/* Header skeleton */}
      <div className="border-border bg-muted/30 border-b p-4">
        <div className="flex items-center gap-2">
          <div className="bg-muted h-9 w-9 rounded-md" />
          <div>
            <div className="bg-muted mb-1 h-4 w-20 rounded" />
            <div className="bg-muted h-3 w-32 rounded" />
          </div>
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="p-4">
        {/* Day labels */}
        <div className="mb-3 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-muted h-4 w-full rounded" />
          ))}
        </div>

        {/* Calendar days (4 rows x 7 cols = 28 days visible) */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="border-border bg-muted/50 aspect-square rounded-md border" />
          ))}
        </div>
      </div>

      {/* Upcoming events skeleton */}
      {showUpcoming && (
        <div className="border-border border-t p-4">
          <div className="bg-muted mb-3 h-4 w-32 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="border-border bg-muted/30 flex items-center gap-3 rounded-md border p-2"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-muted h-3 w-8 rounded" />
                  <div className="bg-muted h-6 w-8 rounded" />
                </div>
                <div className="flex-1">
                  <div className="bg-muted mb-1 h-4 w-32 rounded" />
                  <div className="bg-muted h-3 w-20 rounded" />
                </div>
                <div className="bg-muted h-8 w-8 flex-shrink-0 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

DashboardCalendarSkeleton.displayName = "DashboardCalendarSkeleton";
