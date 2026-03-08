import React from "react";

export function MonitorizareSkeleton(): React.JSX.Element {
  return (
    <div className="animate-pulse space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-xl bg-white/[0.06]" />
          <div className="h-4 w-72 rounded-lg bg-white/[0.04]" />
        </div>
        <div className="h-8 w-28 rounded-xl bg-white/[0.06]" />
      </div>

      {/* Tab pills */}
      <div className="flex gap-1 rounded-xl border border-white/[0.04] bg-white/[0.025] p-1">
        {[140, 100, 120, 130, 110].map((w, i) => (
          <div key={i} className="h-9 rounded-lg bg-white/[0.06]" style={{ width: w }} />
        ))}
      </div>

      {/* Gauges row */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-3 flex flex-col items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
          <div className="h-5 w-32 rounded-lg bg-white/[0.06]" />
          <div className="grid w-full grid-cols-3 justify-items-center gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="h-[72px] w-[72px] rounded-full bg-white/[0.06]" />
                <div className="h-3 w-8 rounded bg-white/[0.04]" />
              </div>
            ))}
          </div>
          <div className="w-full space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-7 rounded-lg bg-white/[0.04]" />
            ))}
          </div>
        </div>

        <div className="col-span-5 space-y-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
          <div className="h-5 w-48 rounded-lg bg-white/[0.06]" />
          <div className="h-[180px] rounded-xl bg-white/[0.04]" />
        </div>

        <div className="col-span-4 space-y-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
          <div className="h-5 w-36 rounded-lg bg-white/[0.06]" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-12 rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        </div>
      </div>

      {/* Chart row */}
      <div className="grid grid-cols-12 gap-5">
        {[4, 4, 4].map((cols, i) => (
          <div
            key={i}
            className={`col-span-${cols} space-y-3 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5`}
          >
            <div className="h-5 w-32 rounded-lg bg-white/[0.06]" />
            <div className="h-[160px] rounded-xl bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </div>
  );
}
