"use client";

import React from "react";

/**
 * FinanciarSkeleton — Animated pulse skeleton for the Financiar page Suspense fallback.
 *
 * Matches the new section order:
 *   header → 6 KPI cards → 4 mini-cards → 2-col charts (area + bar) →
 *   payment methods list + category grid → transaction list.
 */
export function FinanciarSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-5">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-xl bg-white/[0.06]" />
          <div className="h-4 w-56 animate-pulse rounded-lg bg-white/[0.03]" />
        </div>
      </div>

      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white/[0.03] p-4">
            <div className="mb-2 h-5 w-5 rounded-md bg-white/[0.06]" />
            <div className="mb-1.5 h-3 w-20 rounded bg-white/[0.04]" />
            <div className="h-7 w-24 rounded-lg bg-white/[0.06]" />
          </div>
        ))}
      </div>

      {/* 4 mini status filter cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-xl bg-white/[0.03]" />
        ))}
      </div>

      {/* 2-col chart area: AreaChart + BarChart */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="h-[280px] animate-pulse rounded-2xl bg-white/[0.03]" />
        <div className="h-[280px] animate-pulse rounded-2xl bg-white/[0.03]" />
      </div>

      {/* Payment methods + category grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Payment methods list */}
        <div className="animate-pulse rounded-2xl bg-white/[0.03] p-5">
          <div className="mb-4 h-4 w-36 rounded bg-white/[0.06]" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <div className="h-3 w-28 rounded bg-white/[0.04]" />
                  <div className="h-3 w-12 rounded bg-white/[0.04]" />
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>

        {/* Category grid */}
        <div className="animate-pulse rounded-2xl bg-white/[0.03] p-5">
          <div className="mb-4 h-4 w-36 rounded bg-white/[0.06]" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-3 w-20 rounded bg-white/[0.04]" />
                <div className="h-2 w-full rounded-full bg-white/[0.04]" />
                <div className="h-3 w-16 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction list header */}
      <div className="flex items-center justify-between">
        <div className="h-5 w-44 animate-pulse rounded-lg bg-white/[0.06]" />
        <div className="flex gap-2">
          <div className="h-8 w-44 animate-pulse rounded-xl bg-white/[0.03]" />
          <div className="h-8 w-32 animate-pulse rounded-xl bg-white/[0.03]" />
        </div>
      </div>

      {/* Table rows skeleton (6 rows) */}
      <div className="overflow-hidden rounded-2xl bg-white/[0.02]">
        {/* Table header */}
        <div className="border-b border-white/[0.04] px-5 py-3">
          <div className="flex gap-4">
            {[60, 80, 100, 80, 80, 80].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded bg-white/[0.05]"
                style={{ width: `${w}px` }}
              />
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-white/[0.03] px-5 py-3.5">
            <div className="h-4 w-16 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-4 w-20 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-4 w-28 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-4 w-20 animate-pulse rounded bg-white/[0.03]" />
            <div className="h-5 w-20 animate-pulse rounded-md bg-white/[0.03]" />
            <div className="ml-auto h-4 w-8 animate-pulse rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}
