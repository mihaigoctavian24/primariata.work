"use client";

import { cn } from "@/lib/utils";

// ============================================================================
// Skeleton pulse element helper
// ============================================================================

function SkeletonBox({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}): React.ReactElement {
  return (
    <div className={cn("animate-pulse rounded-lg bg-white/[0.06]", className)} style={style} />
  );
}

// ============================================================================
// CereriSkeleton
// ============================================================================

function CereriSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBox className="h-9 w-9 rounded-xl" />
          <div className="space-y-1.5">
            <SkeletonBox className="h-5 w-44" />
            <SkeletonBox className="h-3.5 w-28" />
          </div>
        </div>
        <SkeletonBox className="h-8 w-20 rounded-lg" />
      </div>

      {/* Tab bar — 4 pills */}
      <div
        className="flex gap-1 rounded-xl p-1"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
      >
        {[100, 80, 88, 96].map((w, i) => (
          <SkeletonBox key={i} className="h-9 rounded-lg" style={{ width: w }} />
        ))}
      </div>

      {/* KPI stats — 4 cards (2×2 on mobile, 4-col on lg) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-4">
            <div className="mb-3 flex items-center justify-between">
              <SkeletonBox className="h-9 w-9 rounded-xl" />
            </div>
            <SkeletonBox className="mb-1.5 h-8 w-16" />
            <SkeletonBox className="h-3.5 w-24" />
          </div>
        ))}
      </div>

      {/* Chart + SLA area */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5">
          <SkeletonBox className="mb-4 h-4 w-40" />
          <div className="flex items-center gap-6">
            <SkeletonBox className="h-40 w-40 rounded-full" />
            <div className="flex-1 space-y-2.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SkeletonBox className="h-2.5 w-2.5 rounded-full" />
                    <SkeletonBox className="h-3 w-20" />
                  </div>
                  <SkeletonBox className="h-3 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5">
          <SkeletonBox className="mb-4 h-4 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBox key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Table rows */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-4">
        <div className="mb-4 flex items-center gap-3">
          <SkeletonBox className="h-9 w-48 rounded-lg" />
          <SkeletonBox className="h-9 w-36 rounded-lg" />
          <SkeletonBox className="h-9 flex-1 rounded-lg" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <SkeletonBox className="h-4 w-24" />
              <SkeletonBox className="h-4 w-32" />
              <SkeletonBox className="h-4 w-28" />
              <SkeletonBox className="h-6 w-20 rounded-full" />
              <SkeletonBox className="h-6 w-16 rounded-full" />
              <SkeletonBox className="ml-auto h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { CereriSkeleton };
