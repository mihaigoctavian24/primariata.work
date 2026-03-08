"use client";

/**
 * UtilizatoriSkeleton — Suspense fallback for Utilizatori admin page.
 * Layout-matched skeleton for the full page (header, tabs, search, user list, chart).
 */
export function UtilizatoriSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-white/[0.06]" />
          <div className="h-7 w-36 rounded-md bg-white/[0.06]" />
          <div className="h-5 w-10 rounded-full bg-white/[0.06]" />
        </div>
        <div className="h-9 w-36 rounded-lg bg-white/[0.06]" />
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-0">
        {[80, 72, 92, 64, 60].map((width, i) => (
          <div key={i} className="h-9 rounded-t-md bg-white/[0.06]" style={{ width }} />
        ))}
      </div>

      {/* Search bar */}
      <div className="h-10 w-full max-w-sm rounded-lg bg-white/[0.06]" />

      {/* User rows — 8 skeleton rows */}
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex h-14 items-center gap-4 rounded-xl bg-white/[0.025] px-4">
            {/* Avatar circle */}
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-white/[0.08]" />
            {/* Name + email */}
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-40 rounded bg-white/[0.06]" />
              <div className="h-3 w-56 rounded bg-white/[0.04]" />
            </div>
            {/* Role badge */}
            <div className="h-5 w-20 rounded-full bg-white/[0.06]" />
            {/* Status badge */}
            <div className="h-5 w-16 rounded-full bg-white/[0.06]" />
            {/* Date */}
            <div className="h-4 w-24 rounded bg-white/[0.04]" />
          </div>
        ))}
      </div>

      {/* Growth chart card */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
        <div className="mb-4 h-5 w-48 rounded bg-white/[0.06]" />
        <div className="h-[180px] rounded-lg bg-white/[0.04]" />
      </div>
    </div>
  );
}
