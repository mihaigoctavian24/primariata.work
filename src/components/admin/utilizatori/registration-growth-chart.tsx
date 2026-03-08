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

interface WeekBucket {
  week: string;
  cetatean: number;
  functionar: number;
  primar: number;
  admin: number;
}

interface RegistrationGrowthChartProps {
  growthData: Array<{ created_at: string; rol: string }>;
}

// ============================================================================
// Helpers
// ============================================================================

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  // ISO week number
  const startOfYear = new Date(year, 0, 1);
  const weekNum = Math.ceil(
    ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${year}-W${String(weekNum).padStart(2, "0")}`;
}

function weekLabel(weekKey: string): string {
  // weekKey: "2026-W10" → return short label
  const [, w] = weekKey.split("-");
  return w ?? weekKey;
}

function buildWeekBuckets(data: GrowthDataPoint[]): WeekBucket[] {
  const bucketMap = new Map<string, WeekBucket>();

  for (const item of data) {
    const key = getWeekKey(item.created_at);
    if (!bucketMap.has(key)) {
      bucketMap.set(key, { week: key, cetatean: 0, functionar: 0, primar: 0, admin: 0 });
    }
    const bucket = bucketMap.get(key)!;
    const validRoles = ["cetatean", "functionar", "primar", "admin"] as const;
    type RolKey = (typeof validRoles)[number];
    if ((validRoles as readonly string[]).includes(item.rol)) {
      bucket[item.rol as RolKey] += 1;
    }
  }

  // Sort by week key and keep last 6 weeks
  const sorted = Array.from(bucketMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([, v]) => ({ ...v, week: weekLabel(v.week) }));

  return sorted;
}

// ============================================================================
// Custom Tooltip
// ============================================================================

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps): React.ReactElement | null {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 12,
        color: "var(--card-foreground)",
      }}
    >
      <p style={{ marginBottom: 6, color: "var(--muted-foreground)", fontWeight: 600 }}>{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: entry.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--muted-foreground)" }}>{entry.name}:</span>
          <span style={{ fontWeight: 600 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// Component
// ============================================================================

// Hex colors required — SVG stroke/fill cannot resolve CSS custom properties
const ROLE_COLORS = {
  cetatean: "#3b82f6",
  functionar: "#10b981",
  primar: "#f59e0b",
  admin: "#8b5cf6",
} as const;

const ROLE_LABELS: Record<string, string> = {
  cetatean: "Cetățeni",
  functionar: "Funcționari",
  primar: "Primar",
  admin: "Admin",
};

export function RegistrationGrowthChart({
  growthData,
}: RegistrationGrowthChartProps): React.ReactElement {
  const chartData = useMemo(() => buildWeekBuckets(growthData), [growthData]);

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            {(Object.entries(ROLE_COLORS) as [string, string][]).map(([role, color]) => (
              <linearGradient key={role} id={`grad-${role}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {(Object.entries(ROLE_COLORS) as [string, string][]).map(([role, color]) => (
            <Area
              key={role}
              type="monotone"
              dataKey={role}
              name={ROLE_LABELS[role] ?? role}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${role})`}
              dot={false}
              activeDot={{ r: 4, fill: color, stroke: "var(--background)", strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
