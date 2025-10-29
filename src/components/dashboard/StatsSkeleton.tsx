"use client";

export interface StatsSkeletonProps {
  count?: number;
  className?: string;
}

export function StatsSkeleton({ count = 4, className }: StatsSkeletonProps) {
  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card animate-pulse rounded-lg border p-6 shadow-sm"
          >
            <div className="bg-muted mb-2 h-4 w-24 rounded" />
            <div className="bg-muted mb-2 h-8 w-32 rounded" />
            <div className="bg-muted h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

StatsSkeleton.displayName = "StatsSkeleton";
