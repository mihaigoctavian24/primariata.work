import React from "react";

/**
 * DocumenteSkeleton — animated pulse skeleton for the Documente admin page.
 *
 * Layout-matched to DocumenteContent: header, storage bar, toolbar,
 * breadcrumb, folder cards, file cards.
 */
export function DocumenteSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse space-y-5">
      {/* Header row: title + action buttons */}
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
      <div className="flex items-center gap-4 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
        <div className="h-4 w-4 rounded bg-white/[0.06]" />
        <div className="h-2.5 flex-1 rounded-full bg-white/[0.06]" />
        <div className="h-3 w-28 rounded-lg bg-white/[0.04]" />
      </div>

      {/* Toolbar: search + view toggle */}
      <div className="flex items-center gap-3">
        <div className="h-9 flex-1 rounded-xl bg-white/[0.04]" />
        <div className="h-9 w-20 rounded-lg bg-white/[0.04]" />
      </div>

      {/* Breadcrumb row */}
      <div className="h-4 w-32 rounded-lg bg-white/[0.04]" />

      {/* Folder section label + 3 folder cards */}
      <div>
        <div className="mb-2 h-3 w-16 rounded-lg bg-white/[0.04]" />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-white/[0.04]" />
          ))}
        </div>
      </div>

      {/* File section label + 6 file cards in grid */}
      <div>
        <div className="mb-2 h-3 w-12 rounded-lg bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.04]" />
          ))}
        </div>
      </div>
    </div>
  );
}
