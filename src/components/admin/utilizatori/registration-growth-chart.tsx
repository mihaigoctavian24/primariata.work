"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ============================================================================
// Types
// ============================================================================

interface GrowthDataPoint {
  created_at: string;
  rol: string;
}

interface ChartDataPoint {
  day: string;
  count: number;
}

interface RegistrationGrowthChartProps {
  data: GrowthDataPoint[];
}

// ============================================================================
// Helpers
// ============================================================================

function formatDay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
}

function buildLast30DaysBuckets(): Map<string, number> {
  const buckets = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    buckets.set(key, 0);
  }
  return buckets;
}

// ============================================================================
// Component
// ============================================================================

export function RegistrationGrowthChart({
  data,
}: RegistrationGrowthChartProps): React.ReactElement {
  const chartData = useMemo((): ChartDataPoint[] => {
    const buckets = buildLast30DaysBuckets();

    for (const item of data) {
      const key = item.created_at.slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + 1);
      }
    }

    return Array.from(buckets.entries()).map(([isoDay, count]) => ({
      day: formatDay(isoDay),
      count,
    }));
  }, [data]);

  return (
    <div className="h-[160px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="registrationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-500)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--accent-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "8px",
              fontSize: "12px",
              color: "var(--foreground)",
            }}
            labelStyle={{ color: "var(--muted-foreground)", marginBottom: 2 }}
            cursor={{ stroke: "var(--accent-500)", strokeWidth: 1, strokeDasharray: "4 2" }}
            formatter={(value: number) => [value, "Înregistrări"]}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="var(--accent-500)"
            strokeWidth={2}
            fill="url(#registrationGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--accent-500)",
              stroke: "var(--background)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
