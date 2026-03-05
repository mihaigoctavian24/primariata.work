"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface DonutChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartDataItem[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  className?: string;
}

function DonutChart({ data, centerLabel, centerValue, size = 180, className }: DonutChartProps) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue !== undefined) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue !== undefined && (
            <span className="text-foreground text-2xl leading-none font-bold">{centerValue}</span>
          )}
          {centerLabel && <span className="text-muted-foreground mt-1 text-xs">{centerLabel}</span>}
        </div>
      )}
    </div>
  );
}

export { DonutChart };
export type { DonutChartProps, DonutChartDataItem };
