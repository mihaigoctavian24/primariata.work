"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

interface ActivityChartDataItem {
  date: string;
  value: number;
  [key: string]: string | number;
}

interface ActivityChartProps {
  data: ActivityChartDataItem[];
  dataKey?: string;
  xAxisKey?: string;
  color?: string;
  height?: number;
  className?: string;
}

function ActivityChart({
  data,
  dataKey = "value",
  xAxisKey = "date",
  color = "var(--accent-500)",
  height = 200,
  className,
}: ActivityChartProps) {
  const gradientId = `activity-gradient-${dataKey}`;

  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border-subtle, hsl(var(--border)))"
            vertical={false}
          />
          <XAxis
            dataKey={xAxisKey}
            tick={{ fontSize: 11, fill: "var(--muted-foreground, hsl(var(--muted-foreground)))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "var(--surface-overlay, hsl(var(--popover)))",
              border: "1px solid var(--border-subtle, hsl(var(--border)))",
              color: "var(--foreground, hsl(var(--foreground)))",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
              padding: "0.5rem 0.75rem",
            }}
            itemStyle={{ color: "var(--foreground, hsl(var(--foreground)))" }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { ActivityChart };
export type { ActivityChartProps, ActivityChartDataItem };
