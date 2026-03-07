"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
} from "recharts";
import { CHART_COLORS } from "@/lib/chart-utils";
import type {
  UptimePoint,
  ResponseTimePoint,
  ErrorRatePoint,
  RequestsPerHourPoint,
} from "./monitorizare-content";

// Shared tooltip content style — CSS vars for theming
const tooltipStyle: React.CSSProperties = {
  background: "var(--surface-overlay, rgba(10,10,18,0.95))",
  border: "1px solid var(--border-subtle, rgba(255,255,255,0.08))",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--foreground, #fff)",
};

const axisTickStyle = { fill: "var(--muted-foreground, #6b7280)", fontSize: 11 };
const gridStroke = "rgba(255,255,255,0.04)";

// ─── Uptime Chart ───────────────────────────────────────────────────────────

interface UptimeChartProps {
  data: UptimePoint[];
}

export function UptimeChart({ data }: UptimeChartProps): React.JSX.Element {
  const strokeColor = CHART_COLORS.primary[0]; // blue-500

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis
            domain={[99.5, 100.1]}
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`, "Uptime"]} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            fill="url(#uptimeGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Response Time Chart ────────────────────────────────────────────────────

interface ResponseTimeChartProps {
  data: ResponseTimePoint[];
}

export function ResponseTimeChart({ data }: ResponseTimeChartProps): React.JSX.Element {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis
            tick={axisTickStyle}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `${v}ms`}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v: number, name: string) => [`${v}ms`, name]}
          />
          <Line
            type="monotone"
            dataKey="api"
            name="API"
            stroke={CHART_COLORS.primary[0]}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="db"
            name="DB"
            stroke={CHART_COLORS.primary[1]}
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="cache"
            name="Cache"
            stroke={CHART_COLORS.primary[2]}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Error Rate Chart ───────────────────────────────────────────────────────

interface ErrorRateChartProps {
  data: ErrorRatePoint[];
}

export function ErrorRateChart({ data }: ErrorRateChartProps): React.JSX.Element {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="time" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar
            dataKey="errors4xx"
            name="4xx"
            stackId="err"
            fill={CHART_COLORS.primary[3]}
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="errors5xx"
            name="5xx"
            stackId="err"
            fill={CHART_COLORS.primary[4]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Requests Per Hour Chart (small) ───────────────────────────────────────

interface RequestsPerHourChartProps {
  data: RequestsPerHourPoint[];
}

export function RequestsPerHourChart({ data }: RequestsPerHourChartProps): React.JSX.Element {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis dataKey="hour" tick={axisTickStyle} axisLine={false} tickLine={false} />
          <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Cereri/h"]} />
          <Bar
            dataKey="requests"
            name="Cereri/h"
            fill={CHART_COLORS.primary[1]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
