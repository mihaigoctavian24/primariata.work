"use client";

// ============================================================================
// CalendarSkeleton — layout-matched loading state for the Calendar page
// Two-column: 8/12 calendar grid + 4/12 detail panel
// ============================================================================

export function CalendarSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div
            className="animate-pulse rounded-xl"
            style={{ width: 180, height: 28, background: "rgba(255,255,255,0.06)" }}
          />
          <div
            className="animate-pulse rounded-lg"
            style={{ width: 300, height: 16, background: "rgba(255,255,255,0.03)" }}
          />
        </div>
        {/* "Eveniment Nou" button skeleton */}
        <div
          className="animate-pulse rounded-xl"
          style={{ width: 160, height: 40, background: "rgba(255,255,255,0.06)" }}
        />
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-12 gap-5">
        {/* Calendar grid — col-span-8 */}
        <div
          className="col-span-8 animate-pulse rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Month nav */}
          <div className="mb-5 flex items-center justify-between">
            <div
              className="rounded-xl"
              style={{ width: 140, height: 24, background: "rgba(255,255,255,0.06)" }}
            />
            <div className="flex gap-1">
              {[36, 52, 36].map((w, i) => (
                <div
                  key={i}
                  className="rounded-xl"
                  style={{ width: w, height: 32, background: "rgba(255,255,255,0.04)" }}
                />
              ))}
            </div>
          </div>

          {/* Day name headers */}
          <div className="mb-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg py-2"
                style={{ background: "rgba(255,255,255,0.03)" }}
              />
            ))}
          </div>

          {/* Grid cells — 42 cells (6 rows × 7 cols) */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 42 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl"
                style={{
                  minHeight: 60,
                  background: i % 5 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Detail panel — col-span-4 */}
        <div
          className="col-span-4 flex animate-pulse flex-col gap-4 rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Panel header */}
          <div
            className="rounded-xl"
            style={{ width: "60%", height: 20, background: "rgba(255,255,255,0.06)" }}
          />

          {/* Event cards skeleton */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.04)",
                height: 80,
              }}
            />
          ))}

          {/* Separator */}
          <div className="rounded" style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />

          {/* Upcoming events skeleton */}
          <div
            className="rounded-xl"
            style={{ width: "50%", height: 16, background: "rgba(255,255,255,0.06)" }}
          />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl"
              style={{
                height: 48,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
