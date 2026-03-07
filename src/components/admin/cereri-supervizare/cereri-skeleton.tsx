"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function CereriSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-7 w-56" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      {/* Tab bar skeleton — 4 tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.03)" }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-9 rounded-lg",
              i === 0 ? "w-28" : i === 1 ? "w-24" : i === 2 ? "w-24" : "w-28"
            )}
          />
        ))}
      </div>

      {/* Stats row — 4 cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-4">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-xl" />
            </div>
            <Skeleton className="mb-1 h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Table / kanban area — 8 row skeletons */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-4">
        <div className="mb-4 flex items-center gap-3">
          <Skeleton className="h-9 w-40 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.02)" }}
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="ml-auto h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export { CereriSkeleton };
