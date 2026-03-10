"use client";

export function SaAnalyticsSkeleton() {
  return (
    <div className="flex animate-pulse flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-2 h-8 w-64 rounded-lg bg-white/5"></div>
          <div className="h-4 w-96 rounded-lg bg-white/5"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-20 rounded-xl bg-white/5"></div>
          <div className="h-9 w-20 rounded-xl bg-white/5"></div>
        </div>
      </div>

      {/* Row 1 */}
      <div className="mb-5 grid grid-cols-12 gap-5">
        <div className="col-span-8 h-[340px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-4 flex justify-between">
            <div className="h-5 w-48 rounded bg-white/10"></div>
            <div className="h-4 w-32 rounded bg-white/5"></div>
          </div>
          <div className="h-[240px] w-full rounded-lg bg-white/5"></div>
        </div>
        <div className="col-span-4 h-[340px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-6 h-5 w-40 rounded bg-white/10"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="mb-2 flex justify-between">
                  <div className="h-3 w-32 rounded bg-white/10"></div>
                  <div className="h-3 w-16 rounded bg-white/5"></div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/5"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="mb-5 grid grid-cols-12 gap-5">
        <div className="col-span-6 h-[280px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-5 h-5 w-48 rounded bg-white/10"></div>
          <div className="h-[200px] w-full rounded-lg bg-white/5"></div>
        </div>
        <div className="col-span-6 h-[280px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-5 h-5 w-56 rounded bg-white/10"></div>
          <div className="h-[200px] w-full rounded-lg bg-white/5"></div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-6 h-[320px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-5 h-5 w-64 rounded bg-white/10"></div>
          <div className="h-[240px] w-full rounded-lg bg-white/5"></div>
        </div>
        <div className="col-span-6 h-[320px] rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="mb-6 h-5 w-64 rounded bg-white/10"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-3 w-6 rounded bg-white/5"></div>
                <div className="h-3 w-24 rounded bg-white/10"></div>
                <div className="h-2 flex-1 rounded-full bg-white/5"></div>
                <div className="h-3 w-10 rounded bg-white/10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
