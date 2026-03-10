"use client";

export function SaAdminsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/10"></div>
          <div>
            <div className="mb-1.5 h-6 w-48 rounded-lg bg-white/5"></div>
            <div className="h-3 w-64 rounded-lg bg-white/5"></div>
          </div>
        </div>
        <div className="h-10 w-40 rounded-xl bg-white/5"></div>
      </div>

      {/* KPI Cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[100px] rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="h-8 w-8 rounded-xl bg-white/10"></div>
              <div className="h-3 w-10 rounded bg-white/10"></div>
            </div>
            <div className="mb-1 h-6 w-16 rounded bg-white/10"></div>
            <div className="h-2.5 w-20 rounded bg-white/5"></div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-[220px] rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="mb-4 h-4 w-32 rounded bg-white/10"></div>
            <div className="mx-auto mt-2 h-[140px] w-[140px] rounded-full bg-white/10"></div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-48 rounded-xl bg-white/10"></div>
        <div className="h-8 w-32 rounded-xl bg-white/10"></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-[190px] rounded-2xl border border-white/5 bg-white/5 p-5">
            <div className="mb-4 flex gap-4">
              <div className="h-11 w-11 rounded-xl bg-white/10"></div>
              <div>
                <div className="mb-1.5 h-4 w-32 rounded bg-white/10"></div>
                <div className="mb-1.5 h-3 w-40 rounded bg-white/5"></div>
                <div className="h-2.5 w-24 rounded bg-white/5"></div>
              </div>
            </div>
            <div className="mb-3 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="h-10 rounded-lg bg-white/5"></div>
              ))}
            </div>
            <div className="mt-3 flex justify-between">
              <div className="h-4 w-24 rounded bg-white/10"></div>
              <div className="h-3 w-16 rounded bg-white/5"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
