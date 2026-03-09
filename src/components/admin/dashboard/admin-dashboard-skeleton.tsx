export function AdminDashboardSkeleton(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="border-border/40 bg-card flex h-32 flex-col justify-center gap-4 rounded-xl border p-6">
        <div className="bg-muted h-8 w-64 animate-pulse rounded-md" />
        <div className="bg-muted h-4 w-96 animate-pulse rounded-md" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border-border/40 bg-card h-32 rounded-xl border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="bg-muted h-5 w-24 animate-pulse rounded-md" />
              <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
            </div>
            <div className="bg-muted h-8 w-16 animate-pulse rounded-md" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="border-border/40 bg-card h-96 rounded-xl border p-6 lg:col-span-2">
          <div className="bg-muted mb-6 h-6 w-48 animate-pulse rounded-md" />
          <div className="bg-muted h-64 w-full animate-pulse rounded-md" />
        </div>
        <div className="border-border/40 bg-card h-96 rounded-xl border p-6 lg:col-span-1">
          <div className="bg-muted mb-6 h-6 w-32 animate-pulse rounded-md" />
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="bg-muted h-10 w-10 shrink-0 animate-pulse rounded-full" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="bg-muted h-4 w-full animate-pulse rounded-md" />
                  <div className="bg-muted h-3 w-1/2 animate-pulse rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
