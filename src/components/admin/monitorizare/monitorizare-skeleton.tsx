"use client";

import { motion } from "framer-motion";

export function MonitorizareSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-[1400px] mx-auto min-h-screen">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-8 w-48 bg-white/[0.06] animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-72 bg-white/[0.06] animate-pulse rounded-md" />
        </div>
        <div className="h-8 w-32 bg-white/[0.06] animate-pulse rounded-full" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex flex-wrap gap-2 border-b border-white/[0.05] pb-px">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-24 bg-white/[0.06] animate-pulse rounded-t-lg" />
        ))}
      </div>

      {/* Overview Content Skeleton */}
      <div className="flex flex-col gap-6 animate-in fade-in duration-500">
        
        {/* Row 1: Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px]">
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 rounded-full border-8 border-white/[0.05] animate-pulse" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <div className="h-6 w-12 bg-white/[0.06] animate-pulse rounded" />
                  <div className="h-3 w-8 bg-white/[0.06] animate-pulse rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Row 2: Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/[0.025] border border-white/[0.05] rounded-2xl p-5 flex flex-col h-[280px]">
              {/* Chart Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="h-5 w-32 bg-white/[0.06] animate-pulse rounded-md" />
                <div className="h-5 w-5 bg-white/[0.06] animate-pulse rounded-md" />
              </div>
              
              {/* Chart Area Area */}
              <div className="flex-1 w-full bg-white/[0.03] animate-pulse rounded-lg" />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
