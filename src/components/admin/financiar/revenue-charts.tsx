"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { MonthlyRevenue, DailyVolume, MetodaBreakdown } from "@/lib/financiar-utils";
import { DonutChart } from "@/components/admin/donut-chart";

// ============================================================================
// Chart color constants — CSS custom properties (no hardcoded hex)
// ============================================================================

const COLORS = {
  primary: "var(--accent-500)",
  secondary: "var(--accent-300)",
  tertiary: "var(--accent-200)",
  // Recharts SVG strokes can't use CSS vars directly — we use semantic Tailwind palette
  // that matches the app accent (blue by default, changes with theme)
  stroke: {
    colectat: "#3b82f6",
    target: "#64748b",
    bar: "#3b82f6",
  },
  chart: {
    grid: "rgba(255,255,255,0.04)",
    tick: "#6b7280",
    tooltipBg: "rgba(15,15,25,0.95)",
    tooltipBorder: "rgba(255,255,255,0.08)",
  },
  donut: {
    card: "#3b82f6",
    transfer: "#06b6d4",
    numerar: "#f59e0b",
  },
};

// ============================================================================
// Shared Tooltip
// ============================================================================

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2"
      style={{
        background: COLORS.chart.tooltipBg,
        border: `1px solid ${COLORS.chart.tooltipBorder}`,
        fontSize: "0.78rem",
      }}
    >
      {label && (
        <div className="mb-1" style={{ color: COLORS.chart.tick, fontSize: "0.72rem" }}>
          {label}
        </div>
      )}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
          <span style={{ color: "#9ca3af" }}>{p.name}:</span>
          <span style={{ color: "#f9fafb", fontWeight: 600 }}>
            {p.value.toLocaleString("ro-RO")} RON
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// MonthlyRevenueChart
// ============================================================================

interface MonthlyRevenueChartProps {
  data: MonthlyRevenue[];
}

function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps): React.JSX.Element {
  // Empty state: generate 7 zero-months as placeholder
  const isEmpty = data.length === 0;
  const chartData = isEmpty
    ? ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul"].map((month) => ({
        month,
        colectat: 0,
        target: 0,
      }))
    : data;

  return (
    <div className="relative h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colectatGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.stroke.colectat} stopOpacity={0.22} />
              <stop offset="95%" stopColor={COLORS.stroke.colectat} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />
          <XAxis
            dataKey="month"
            tick={{ fill: COLORS.chart.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: COLORS.chart.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => (v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`)}
          />
          <Tooltip content={<ChartTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: "0.72rem", color: COLORS.chart.tick }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="colectat"
            name="Colectat"
            stroke={COLORS.stroke.colectat}
            strokeWidth={2}
            fill="url(#colectatGrad)"
          />
          <Area
            type="monotone"
            dataKey="target"
            name="Target"
            stroke={COLORS.stroke.target}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="none"
          />
        </AreaChart>
      </ResponsiveContainer>

      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span
            className="rounded-lg px-3 py-1.5"
            style={{
              background: "rgba(0,0,0,0.5)",
              color: "#9ca3af",
              fontSize: "0.82rem",
            }}
          >
            Nu există date de plată
          </span>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// DailyVolumeChart
// ============================================================================

interface DailyVolumeChartProps {
  data: DailyVolume[];
}

function DailyVolumeChart({ data }: DailyVolumeChartProps): React.JSX.Element {
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chart.grid} />
          <XAxis
            dataKey="day"
            tick={{ fill: COLORS.chart.tick, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: COLORS.chart.tick, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div
                  className="rounded-xl px-3 py-2"
                  style={{
                    background: COLORS.chart.tooltipBg,
                    border: `1px solid ${COLORS.chart.tooltipBorder}`,
                    fontSize: "0.78rem",
                  }}
                >
                  <div className="mb-1" style={{ color: COLORS.chart.tick, fontSize: "0.72rem" }}>
                    {label}
                  </div>
                  <div style={{ color: "#f9fafb", fontWeight: 600 }}>
                    {payload[0]?.value ?? 0} tranzacții
                  </div>
                </div>
              );
            }}
          />
          <Bar
            dataKey="volume"
            name="Tranzacții"
            fill={COLORS.stroke.bar}
            radius={[4, 4, 0, 0]}
            barSize={28}
            opacity={0.85}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================================
// MetodaChart (DonutChart wrapper)
// ============================================================================

interface MetodaChartProps {
  data: MetodaBreakdown;
}

function MetodaChart({ data }: MetodaChartProps): React.JSX.Element {
  const isEmpty = data.card === 0 && data.transfer === 0 && data.numerar === 0;

  if (isEmpty) {
    return (
      <div className="flex h-[160px] flex-col items-center justify-center gap-2">
        <div
          className="h-16 w-16 rounded-full"
          style={{ border: "2px dashed rgba(255,255,255,0.06)" }}
        />
        <span style={{ color: "#6b7280", fontSize: "0.78rem" }}>Fără date de plată</span>
      </div>
    );
  }

  const donutData = [
    { name: "Card", value: data.card, color: COLORS.donut.card },
    { name: "Transfer", value: data.transfer, color: COLORS.donut.transfer },
    { name: "Numerar", value: data.numerar, color: COLORS.donut.numerar },
  ].filter((d) => d.value > 0);

  const total = data.card + data.transfer + data.numerar;

  return (
    <div className="flex flex-col items-center gap-3">
      <DonutChart data={donutData} centerLabel="total" centerValue={total} size={120} />
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {donutData.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
            <span style={{ color: "#9ca3af", fontSize: "0.72rem" }}>
              {d.name}{" "}
              <span style={{ color: "#f9fafb", fontWeight: 600 }}>
                {Math.round((d.value / total) * 100)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Exports
// ============================================================================

export { MonthlyRevenueChart, DailyVolumeChart, MetodaChart };
export type { MonthlyRevenueChartProps, DailyVolumeChartProps, MetodaChartProps };
