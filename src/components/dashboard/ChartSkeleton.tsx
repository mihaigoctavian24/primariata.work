"use client";

export interface ChartSkeletonProps {
  height?: number;
  className?: string;
}

export function ChartSkeleton({ height = 300, className }: ChartSkeletonProps) {
  return (
    <div className={className}>
      <div className="border-border bg-card animate-pulse rounded-lg border p-6 shadow-sm">
        <div className="mb-4 space-y-2">
          <div className="bg-muted h-5 w-32 rounded" />
          <div className="bg-muted h-3 w-48 rounded" />
        </div>
        <div className="bg-muted rounded" style={{ height: `${height}px` }} />
      </div>
    </div>
  );
}

ChartSkeleton.displayName = "ChartSkeleton";
