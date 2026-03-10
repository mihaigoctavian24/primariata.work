"use client";

export function SaAuditSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 h-8 w-64 rounded-lg bg-white/5"></div>
          <div className="h-4 w-96 rounded-lg bg-white/5"></div>
        </div>
        <div className="h-10 w-32 rounded-xl bg-white/5"></div>
      </div>

      {/* Filters */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-10 flex-1 rounded-xl bg-white/5"></div>
        <div className="h-10 w-40 rounded-xl bg-white/5"></div>
        <div className="flex gap-1 rounded-xl bg-white/5 p-1">
          <div className="h-8 w-20 rounded-lg bg-white/10"></div>
          <div className="h-8 w-24 rounded-lg bg-white/5"></div>
          <div className="h-8 w-28 rounded-lg bg-white/5"></div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-white/5">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-white/5 px-5 py-4 last:border-0"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-white/10"></div>
            <div className="w-20 shrink-0">
              <div className="mb-1 h-4 w-12 rounded bg-white/10"></div>
              <div className="h-3 w-16 rounded bg-white/5"></div>
            </div>
            <div className="w-36 shrink-0">
              <div className="mb-1 h-4 w-24 rounded bg-white/10"></div>
              <div className="h-4 w-16 rounded-full bg-white/5"></div>
            </div>
            <div className="w-24 shrink-0">
              <div className="h-5 w-20 rounded-full bg-white/10"></div>
            </div>
            <div className="flex-1">
              <div className="mb-1.5 h-4 w-64 rounded bg-white/10"></div>
              <div className="h-3 w-32 rounded bg-white/5"></div>
            </div>
            <div className="flex w-28 shrink-0 justify-end text-right">
              <div className="h-3 w-24 rounded bg-white/5"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Container */}
      <div className="mt-4 flex justify-between">
        <div className="h-4 w-40 rounded bg-white/5"></div>
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/5"></div>
          <div className="h-8 w-8 rounded-lg bg-white/5"></div>
        </div>
      </div>
    </div>
  );
}
