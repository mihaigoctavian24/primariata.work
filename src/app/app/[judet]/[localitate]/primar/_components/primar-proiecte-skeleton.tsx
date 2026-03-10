export function PrimarProiecteSkeleton(): React.ReactElement {
  return (
    <div className="animate-pulse space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 rounded-lg bg-white/[0.06]" />
          <div className="mt-1.5 h-4 w-60 rounded-md bg-white/[0.04]" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-amber-500/10" />
      </div>

      {/* Project rows skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-5 w-48 rounded-md bg-white/[0.06]" />
                <div className="h-5 w-20 rounded-full bg-white/[0.04]" />
              </div>
              <div className="h-3.5 w-32 rounded bg-white/[0.04]" />
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-white/[0.06]" />
                <div className="h-3 w-8 rounded bg-white/[0.04]" />
              </div>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/[0.06]" />
              <div className="h-8 w-8 rounded-lg bg-white/[0.06]" />
            </div>
          </div>
          <div className="mt-3 flex gap-4">
            <div className="h-3.5 w-36 rounded bg-white/[0.04]" />
            <div className="h-3.5 w-24 rounded bg-white/[0.04]" />
          </div>
        </div>
      ))}
    </div>
  );
}
