import React from "react";

export function PrimarRapoarteSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-6">
      {/* Period filter pills */}
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-8 w-28 rounded-full bg-white/[0.06]" />
        ))}
      </div>

      {/* Cereri lunare table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
        <div className="mb-4 h-5 w-44 rounded-lg bg-white/[0.06]" />
        {/* Header row */}
        <div className="mb-2 flex gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-white/[0.04]" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-2 h-10 rounded-lg bg-white/[0.04]" />
        ))}
      </div>

      {/* Departamente table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
        <div className="mb-4 h-5 w-56 rounded-lg bg-white/[0.06]" />
        {/* Header row */}
        <div className="mb-2 flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded bg-white/[0.04]" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="mb-2 h-10 rounded-lg bg-white/[0.04]" />
        ))}
      </div>

      {/* Download button skeleton */}
      <div className="h-10 w-48 rounded-xl bg-amber-500/10" />
    </div>
  );
}
