"use client";

export function SaSettingsSkeleton() {
  return (
    <div className="flex max-w-3xl animate-pulse flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 h-8 w-56 rounded-lg bg-white/5"></div>
        <div className="h-4 w-96 rounded-lg bg-white/5"></div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex w-fit gap-2 rounded-xl bg-white/5 p-1">
        <div className="h-9 w-32 rounded-lg bg-white/10"></div>
        <div className="h-9 w-32 rounded-lg bg-white/5"></div>
        <div className="h-9 w-32 rounded-lg bg-white/5"></div>
      </div>

      {/* Content - System Tab */}
      <div className="space-y-5">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10"></div>
              <div>
                <div className="mb-1.5 h-4 w-40 rounded bg-white/10"></div>
                <div className="h-3 w-64 rounded bg-white/5"></div>
              </div>
            </div>
            <div className="h-6 w-10 rounded-full bg-white/10"></div>
          </div>
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/5 bg-white/5 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-4 w-4 rounded bg-white/10"></div>
              <div>
                <div className="mb-1 h-4 w-32 rounded bg-white/10"></div>
                <div className="h-3 w-56 rounded bg-white/5"></div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-32 rounded-xl bg-white/10"></div>
              <div className="h-3 w-16 rounded bg-white/5"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
