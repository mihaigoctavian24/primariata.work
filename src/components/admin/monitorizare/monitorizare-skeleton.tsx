"use client";

import React from "react";

/**
 * MonitorizareSkeleton — layout-matched skeleton for the Monitorizare page Suspense fallback.
 * Matches the section order: header → 4 stat cards → 3 charts → services grid.
 */
export function MonitorizareSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-5">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-white/[0.03]" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-xl bg-white/[0.06]" />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
        ))}
      </div>

      {/* Uptime chart */}
      <div className="h-[200px] animate-pulse rounded-2xl bg-white/[0.03]" />

      {/* Response time + requests side by side */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 h-[200px] animate-pulse rounded-2xl bg-white/[0.03]" />
        <div className="h-[200px] animate-pulse rounded-2xl bg-white/[0.03]" />
      </div>

      {/* Error rate chart */}
      <div className="h-[200px] animate-pulse rounded-2xl bg-white/[0.03]" />

      {/* Services grid — 12 items */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  );
}
