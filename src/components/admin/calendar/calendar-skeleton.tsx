"use client";

// ============================================================================
// CalendarSkeleton — layout-matched loading state for the Calendar page
// ============================================================================

export function CalendarSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div
            className="animate-pulse rounded-xl"
            style={{
              width: 180,
              height: 28,
              background: "rgba(255,255,255,0.06)",
            }}
          />
          <div
            className="animate-pulse rounded-lg"
            style={{
              width: 280,
              height: 16,
              background: "rgba(255,255,255,0.03)",
            }}
          />
        </div>
        {/* "Adaugă Eveniment" button skeleton */}
        <div
          className="animate-pulse rounded-xl"
          style={{
            width: 160,
            height: 40,
            background: "rgba(255,255,255,0.06)",
          }}
        />
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* Left: Calendar grid */}
        <div
          className="flex-1 animate-pulse rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Month nav */}
          <div className="mb-5 flex items-center justify-between">
            <div
              className="rounded-xl"
              style={{ width: 120, height: 24, background: "rgba(255,255,255,0.06)" }}
            />
            <div className="flex gap-1">
              {[40, 56, 40].map((w, i) => (
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
                  height: 72,
                  background: i % 5 === 0 ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
                }}
              />
            ))}
          </div>
        </div>

        {/* Right: Day detail panel */}
        <div
          className="flex shrink-0 flex-col gap-3 rounded-2xl p-5"
          style={{
            width: 340,
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Panel header */}
          <div
            className="animate-pulse rounded-xl"
            style={{ width: "60%", height: 20, background: "rgba(255,255,255,0.06)" }}
          />

          {/* Event cards skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl p-3"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.04)",
                height: 80,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
