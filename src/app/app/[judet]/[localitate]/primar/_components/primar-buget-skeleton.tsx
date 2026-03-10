export function PrimarBugetSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-6">
      {/* Page header skeleton */}
      <div>
        <div className="h-7 w-48 rounded-lg bg-white/[0.06]" />
        <div className="mt-1.5 h-4 w-72 rounded-md bg-white/[0.04]" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="h-24 rounded-2xl bg-white/[0.06]" />
        <div className="h-24 rounded-2xl bg-white/[0.06]" />
      </div>

      {/* Chart + allocation list skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* DonutChart placeholder */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/[0.04] p-8">
          <div className="h-64 w-64 rounded-full bg-white/[0.06]" />
        </div>

        {/* Allocation rows */}
        <div className="space-y-4 rounded-2xl bg-white/[0.04] p-6">
          <div className="h-5 w-32 rounded-md bg-white/[0.06]" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex h-12 items-center gap-3">
              <div className="h-3 w-3 flex-shrink-0 rounded-full bg-white/[0.08]" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 rounded bg-white/[0.06]" />
                <div className="h-3 w-24 rounded bg-white/[0.04]" />
              </div>
              <div className="h-4 w-20 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
