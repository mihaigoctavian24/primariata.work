"use client";

import React from "react";

/**
 * FinanciarSkeleton — layout-matched skeleton for the Financiar page Suspense fallback.
 * Matches the section order: header → 4 stat cards → revenue chart + metoda chart →
 * category progress bars → daily volume chart → transaction list.
 */
export function FinanciarSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-5">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-36 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-4 w-52 animate-pulse rounded-lg bg-white/[0.03]" />
        </div>
        <div className="h-4 w-32 animate-pulse rounded-lg bg-white/[0.03]" />
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
        ))}
      </div>

      {/* Monthly revenue chart (large) + metoda donut side by side */}
      <div className="grid grid-cols-3 gap-5">
        {/* Left 2/3: monthly area chart */}
        <div className="col-span-2 h-[290px] animate-pulse rounded-2xl bg-white/[0.03]" />
        {/* Right 1/3: metoda donut + category bars */}
        <div className="flex flex-col gap-4">
          <div className="h-[160px] animate-pulse rounded-2xl bg-white/[0.03]" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
                  <div className="h-3 w-8 animate-pulse rounded bg-white/[0.04]" />
                </div>
                <div className="h-2 w-full animate-pulse rounded-full bg-white/[0.03]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily volume bar chart */}
      <div className="h-[240px] animate-pulse rounded-2xl bg-white/[0.03]" />

      {/* Transaction list header */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="flex gap-2">
          <div className="h-8 w-36 animate-pulse rounded-xl bg-white/[0.03]" />
          <div className="h-8 w-28 animate-pulse rounded-xl bg-white/[0.03]" />
        </div>
      </div>

      {/* Table rows skeleton (8 rows) */}
      <div className="overflow-hidden rounded-2xl bg-white/[0.02]">
        {/* Table header */}
        <div className="border-b border-white/[0.04] px-5 py-3">
          <div className="flex gap-4">
            {[80, 120, 100, 80, 80, 80].map((w, i) => (
              <div key={i} className={`h-3 w-[${w}px] animate-pulse rounded bg-white/[0.05]`} />
            ))}
          </div>
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-white/[0.03] px-5 py-3.5">
            <div className="h-4 w-20 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-4 w-24 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-4 w-20 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-5 w-20 animate-pulse rounded-md bg-white/[0.03]" />
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}
