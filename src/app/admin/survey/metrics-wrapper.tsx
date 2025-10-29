"use client";

import { useEffect, useState } from "react";
import { AdminSurveyMetrics as MetricsComponent } from "./page-client";

// Client-side only wrapper to prevent React Query SSR hydration issues
export function AdminSurveyMetrics() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-border bg-card animate-pulse rounded-lg border p-6 shadow-sm"
          >
            <div className="bg-muted mb-2 h-4 w-24 rounded" />
            <div className="bg-muted mb-2 h-8 w-32 rounded" />
            <div className="bg-muted h-3 w-20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return <MetricsComponent />;
}
