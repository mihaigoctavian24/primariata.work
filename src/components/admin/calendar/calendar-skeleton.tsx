"use client";

import { motion } from "framer-motion";

export function CalendarSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-white/[0.06] animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-72 bg-white/[0.06] animate-pulse rounded-md" />
        </div>
        <div className="h-10 w-36 bg-white/[0.06] animate-pulse rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar Grid Skeleton (col-span-8) */}
        <div className="col-span-1 lg:col-span-8 bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5">
          {/* Month Nav Bar Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-32 bg-white/[0.06] animate-pulse rounded-md" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-white/[0.06] animate-pulse rounded-md" />
              <div className="h-8 w-16 bg-white/[0.06] animate-pulse rounded-md" />
              <div className="h-8 w-8 bg-white/[0.06] animate-pulse rounded-md" />
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-4 w-8 mx-auto bg-white/[0.06] animate-pulse rounded-sm" />
            ))}
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 42 }).map((_, i) => (
              <div
                key={i}
                className="h-[60px] bg-white/[0.06] animate-pulse rounded-xl"
              />
            ))}
          </div>
        </div>

        {/* Panel Skeleton (col-span-4) */}
        <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
          <div className="h-64 bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-4">
            <div className="h-6 w-3/4 bg-white/[0.06] animate-pulse rounded-md" />
            <div className="h-20 bg-white/[0.06] animate-pulse rounded-xl" />
            <div className="h-20 bg-white/[0.06] animate-pulse rounded-xl" />
          </div>
          
          <div className="h-64 bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-4">
            <div className="h-6 w-1/2 bg-white/[0.06] animate-pulse rounded-md" />
            <div className="h-12 bg-white/[0.06] animate-pulse rounded-xl" />
            <div className="h-12 bg-white/[0.06] animate-pulse rounded-xl" />
            <div className="h-12 bg-white/[0.06] animate-pulse rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
