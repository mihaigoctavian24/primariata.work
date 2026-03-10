"use client";

export function SaPrimariiSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 h-8 w-64 rounded-lg bg-white/5"></div>
          <div className="h-4 w-96 rounded-lg bg-white/5"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-9 w-40 rounded-xl bg-white/5"></div>
          <div className="h-9 w-32 rounded-xl bg-white/5"></div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[110px] rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="mb-2.5 flex items-center justify-between">
              <div className="h-8 w-8 rounded-xl bg-white/10"></div>
              <div className="h-4 w-10 rounded bg-white/10"></div>
            </div>
            <div className="mb-1 h-6 w-20 rounded bg-white/10"></div>
            <div className="h-3 w-16 rounded bg-white/5"></div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-5 grid grid-cols-12 gap-5">
        <div className="col-span-3 h-[280px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-2 h-5 w-32 rounded bg-white/10"></div>
          <div className="mb-6 h-3 w-40 rounded bg-white/5"></div>
          <div className="mx-auto h-32 w-32 rounded-full bg-white/10"></div>
        </div>
        <div className="col-span-5 h-[280px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-2 h-5 w-48 rounded bg-white/10"></div>
          <div className="mb-6 h-3 w-56 rounded bg-white/5"></div>
          <div className="h-[180px] w-full rounded bg-white/10"></div>
        </div>
        <div className="col-span-4 h-[280px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-2 h-5 w-40 rounded bg-white/10"></div>
          <div className="mb-6 h-3 w-48 rounded bg-white/5"></div>
          <div className="h-[180px] w-full rounded bg-white/10"></div>
        </div>
      </div>

      {/* Grid List Skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-48 rounded bg-white/10"></div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-44 rounded-xl bg-white/10"></div>
          <div className="h-10 w-32 rounded-xl bg-white/10"></div>
          <div className="h-10 w-32 rounded-xl bg-white/10"></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[180px] rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="mb-4 flex justify-between">
              <div className="flex gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/10"></div>
                <div>
                  <div className="mb-1.5 h-4 w-32 rounded bg-white/10"></div>
                  <div className="h-3 w-24 rounded bg-white/5"></div>
                </div>
              </div>
            </div>
            <div className="mb-4 grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-10 rounded-lg bg-white/5"></div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <div className="h-6 w-16 rounded bg-white/10"></div>
              <div className="h-3 w-20 rounded bg-white/5"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
