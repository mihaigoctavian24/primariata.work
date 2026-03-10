export function PrimarDashboardSkeleton(): React.ReactElement {
  return (
    <div className="flex animate-pulse flex-col">
      {/* Section 1: Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-white/[0.05]" />
          <div>
            <div className="mb-2 h-7 w-64 rounded-xl bg-white/[0.05]" />
            <div className="h-4 w-80 rounded-xl bg-white/[0.05]" />
          </div>
        </div>
        <div className="h-6 w-32 rounded-lg bg-white/[0.05]" />
      </div>

      {/* Section 2: KPI cards — 5 cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border border-white/[0.05] bg-white/[0.05]" />
        ))}
      </div>

      {/* Section 3: Chart + Departamente (2-col on lg) */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* AreaChart placeholder */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.05] p-5">
          <div className="mb-4 h-5 w-40 rounded-xl bg-white/[0.05]" />
          <div className="h-64 w-full rounded-xl bg-white/[0.05]" />
        </div>

        {/* Departamente list */}
        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.05] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-32 rounded-xl bg-white/[0.05]" />
            <div className="h-7 w-24 rounded-lg bg-white/[0.05]" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.05]" />
            ))}
          </div>
        </div>
      </div>

      {/* Section 4: Proiecte */}
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.05] p-5">
        <div className="mb-4 h-5 w-28 rounded-xl bg-white/[0.05]" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.05] bg-white/[0.05] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="h-4 w-48 rounded-lg bg-white/[0.05]" />
                <div className="h-5 w-20 rounded-full bg-white/[0.05]" />
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
