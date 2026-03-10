export function PrimarCereriSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-6">
      {/* Tab bar */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-9 w-36 rounded-full" />
        ))}
      </div>

      {/* KPI cards row */}
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-muted h-24 rounded-xl" />
        ))}
      </div>

      {/* Table area */}
      <div className="bg-card overflow-hidden rounded-xl border border-white/5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="bg-muted/40 mx-4 my-3 h-14 rounded-lg" />
            {i < 7 && <div className="bg-border/30 h-px" />}
          </div>
        ))}
      </div>
    </div>
  );
}
