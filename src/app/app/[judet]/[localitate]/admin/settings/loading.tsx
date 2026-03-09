export default function Loading(): React.JSX.Element {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="bg-muted h-8 w-32 animate-pulse rounded" />
        <div className="bg-muted mt-2 h-4 w-64 animate-pulse rounded" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-10 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="lg:col-span-9">
          <div className="border-border/40 rounded-xl border p-6">
            <div className="space-y-4">
              <div className="bg-muted h-6 w-48 animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded" />
              <div className="bg-muted h-10 w-full animate-pulse rounded" />
              <div className="bg-muted h-24 w-full animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
