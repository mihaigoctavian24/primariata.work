import React from "react";

export function PrimarAgendeSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-4 p-4">
      {/* Month navigation header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 rounded-md bg-white/[0.05]" />
        <div className="h-6 w-32 rounded-md bg-white/[0.05]" />
        <div className="h-8 w-8 rounded-md bg-white/[0.05]" />
      </div>

      {/* Weekday labels row */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex justify-center">
            <div className="h-4 w-8 rounded bg-white/[0.05]" />
          </div>
        ))}
      </div>

      {/* Calendar grid: 6 rows × 7 columns */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, i) => (
          <div key={i} className="h-16 rounded-md bg-white/[0.05] p-1">
            <div className="h-4 w-6 rounded bg-white/[0.03]" />
          </div>
        ))}
      </div>
    </div>
  );
}
