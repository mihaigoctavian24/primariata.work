import React from "react";

/**
 * DocumenteSkeleton — layout-matched skeleton for the Documente admin page.
 * Rendered via Suspense fallback while the server component fetches storage data.
 */
export function DocumenteSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded-xl bg-white/[0.06]" />
          <div className="h-3.5 w-32 rounded-lg bg-white/[0.04]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-xl bg-white/[0.04]" />
          <div className="h-9 w-24 rounded-xl bg-white/[0.06]" />
        </div>
      </div>

      {/* Storage usage bar */}
      <div
        className="flex items-center gap-4 rounded-xl px-4 py-3"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="h-4 w-4 rounded bg-white/[0.06]" />
        <div className="h-3 flex-1 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-28 rounded-lg bg-white/[0.04]" />
      </div>

      {/* Toolbar row */}
      <div className="flex items-center gap-3">
        <div className="h-9 flex-1 rounded-xl bg-white/[0.04]" />
        <div className="h-9 w-20 rounded-lg bg-white/[0.04]" />
      </div>

      {/* Breadcrumb */}
      <div className="h-4 w-32 rounded-lg bg-white/[0.04]" />

      {/* Upload zone skeleton */}
      <div
        className="h-24 w-full rounded-2xl"
        style={{
          background: "rgba(255,255,255,0.015)",
          border: "2px dashed rgba(255,255,255,0.06)",
        }}
      />

      {/* File grid — 9 cards */}
      <div>
        <div className="mb-3 h-3.5 w-16 rounded-lg bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.025)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
