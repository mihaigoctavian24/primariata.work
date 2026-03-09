"use client";

export function CalendarSkeleton() {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 h-8 w-48 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="h-4 w-72 animate-pulse rounded-md bg-white/[0.06]" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-xl bg-white/[0.06]" />
      </div>

      <div className="grid w-full grid-cols-12 gap-5">
        {/* Calendar Grid Skeleton (col-span-8) */}
        <div className="col-span-8 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
          {/* Month Nav Bar Skeleton */}
          <div className="mb-6 flex items-center justify-between">
            <div className="h-6 w-32 animate-pulse rounded-md bg-white/[0.06]" />
            <div className="flex gap-2">
              <div className="h-8 w-8 animate-pulse rounded-md bg-white/[0.06]" />
              <div className="h-8 w-16 animate-pulse rounded-md bg-white/[0.06]" />
              <div className="h-8 w-8 animate-pulse rounded-md bg-white/[0.06]" />
            </div>
          </div>

          {/* Day Headers */}
          <div className="mb-4 grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="mx-auto h-4 w-8 animate-pulse rounded-sm bg-white/[0.06]" />
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="min-h-[60px] w-full animate-pulse rounded-xl bg-white/[0.06] lg:min-h-[100px]"
              />
            ))}
          </div>
        </div>

        {/* Panel Skeleton (col-span-4) */}
        <div className="col-span-4 flex flex-col gap-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
            <div className="h-6 w-3/4 animate-pulse rounded-md bg-white/[0.06]" />
            <div className="h-20 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="h-20 animate-pulse rounded-xl bg-white/[0.06]" />
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
            <div className="h-6 w-1/2 animate-pulse rounded-md bg-white/[0.06]" />
            <div className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="h-12 animate-pulse rounded-xl bg-white/[0.06]" />
          </div>
        </div>
      </div>
    </div>
  );
}
