"use client";

import { useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CreditCard, Building2, Landmark, Smartphone } from "lucide-react";

import type { MonthlyRevenueExtended, DailyVolume, MetodaBreakdown } from "@/lib/financiar-utils";

// ============================================================================
// Mock categories — graceful fallback (plati table has no category column)
// ============================================================================

// Category data: graceful mock — plati table has no category column
const MOCK_CATEGORIES = [
  { name: "Taxe Locale", colectat: 0, target: 50_000, color: "#3b82f6" },
  { name: "Autorizații", colectat: 0, target: 20_000, color: "#8b5cf6" },
  { name: "Amenzi", colectat: 0, target: 15_000, color: "#ef4444" },
  { name: "Certificări", colectat: 0, target: 8_000, color: "#10b981" },
  { name: "Impozite Proprietăți", colectat: 0, target: 12_000, color: "#f59e0b" },
  { name: "Altele", colectat: 0, target: 5_000, color: "#6b7280" },
];

// ============================================================================
// Types
// ============================================================================

interface RevenueChartsProps {
  monthlyData: MonthlyRevenueExtended[];
  dailyData: DailyVolume[];
  metodaData: MetodaBreakdown;
}

// ============================================================================
// Shared chart color constants (hex — SVG stroke attributes require hex)
// ============================================================================

const CHART = {
  grid: "rgba(255,255,255,0.04)",
  tick: "#6b7280",
  colectat: "#10b981",
  esuat: "#ef4444",
  bar: "#3b82f6",
} as const;

// ============================================================================
// CustomTooltip — uses CSS tokens (bg-popover border-border)
// ============================================================================

function CustomTooltip({
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
    <div className="border-border bg-popover rounded-xl border px-3 py-2 shadow-lg">
      {label && <div className="text-muted-foreground mb-1.5 text-[0.7rem]">{label}</div>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 text-[0.75rem]">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="text-foreground font-semibold">
            {typeof p.value === "number" ? p.value.toLocaleString("ro-RO") : p.value} RON
          </span>
        </div>
      ))}
    </div>
  );
}

function DailyTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-border bg-popover rounded-xl border px-3 py-2 shadow-lg">
      <div className="text-muted-foreground mb-1 text-[0.7rem]">{label}</div>
      <div className="text-foreground text-sm font-semibold">
        {payload[0]?.value ?? 0} tranzacții
      </div>
    </div>
  );
}

// ============================================================================
// RevenueAreaChart
// ============================================================================

function RevenueAreaChart({ data }: { data: MonthlyRevenueExtended[] }): React.JSX.Element {
  const [period, setPeriod] = useState<"6m" | "1y">("6m");

  const sliceCount = period === "6m" ? 6 : 12;
  const isEmpty = data.length === 0;

  const chartData = isEmpty
    ? (["Ian", "Feb", "Mar", "Apr", "Mai", "Iun"] as const).map((month) => ({
        month,
        colectat: 0,
        esuat: 0,
      }))
    : data.slice(-sliceCount);

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[0.93rem] font-semibold text-white">Venituri lunare</h3>
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-0.5">
          {(["6m", "1y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1 text-[0.72rem] font-medium transition-all ${
                period === p ? "bg-white/[0.1] text-white" : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {p === "6m" ? "6 luni" : "1 an"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colectatGrad20" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART.colectat} stopOpacity={0.25} />
                <stop offset="95%" stopColor={CHART.colectat} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="esuatGrad20" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART.esuat} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART.esuat} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
            <XAxis
              dataKey="month"
              tick={{ fill: CHART.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART.tick, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => (v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="colectat"
              name="Colectat"
              stroke={CHART.colectat}
              strokeWidth={2}
              fill="url(#colectatGrad20)"
            />
            <Area
              type="monotone"
              dataKey="esuat"
              name="Eșuat"
              stroke={CHART.esuat}
              strokeWidth={2}
              fill="url(#esuatGrad20)"
            />
          </AreaChart>
        </ResponsiveContainer>

        {isEmpty && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-lg bg-black/50 px-3 py-1.5 text-[0.82rem] text-gray-400">
              Nu există date de plată
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4">
        {[
          { color: CHART.colectat, label: "Colectat" },
          { color: CHART.esuat, label: "Eșuat" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
            <span className="text-[0.7rem] text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// DailyVolumeBarChart
// ============================================================================

function DailyVolumeBarChart({ data }: { data: DailyVolume[] }): React.JSX.Element {
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
      <h3 className="mb-4 text-[0.93rem] font-semibold text-white">
        Volum zilnic — tranzacții pe zile
      </h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
            <XAxis
              dataKey="day"
              tick={{ fill: CHART.tick, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART.tick, fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<DailyTooltip />} />
            <Bar
              dataKey="volume"
              name="Tranzacții"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={28}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ============================================================================
// PaymentMethodsList
// ============================================================================

const METODA_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  card: { label: "Card Online", icon: CreditCard, colorClass: "bg-blue-500" },
  transfer: { label: "Transfer Bancar", icon: Building2, colorClass: "bg-cyan-500" },
  numerar: { label: "Ghișeu / Numerar", icon: Landmark, colorClass: "bg-amber-500" },
  other: { label: "Altele", icon: Smartphone, colorClass: "bg-slate-500" },
};

// SVG fill attributes require hex values — CSS vars cannot be used in SVG stroke/fill (Phase 19 decision)
const METODA_COLORS = ["#3b82f6", "#06b6d4", "#f59e0b", "#6b7280"] as const;

function PaymentMethodsList({ data }: { data: MetodaBreakdown }): React.JSX.Element {
  const entries = Object.entries({
    card: data.card,
    transfer: data.transfer,
    numerar: data.numerar,
  })
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const isEmpty = total === 0;

  // Donut chart data with per-method colors
  const donutData = entries.map(([metoda, count], i) => ({
    name: METODA_CONFIG[metoda]?.label ?? metoda,
    value: count,
    color: METODA_COLORS[i % METODA_COLORS.length]!,
  }));

  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
      <h3 className="mb-4 text-[0.93rem] font-semibold text-white">Metode de Plată</h3>

      {isEmpty ? (
        <div className="flex h-24 items-center justify-center">
          <span className="text-[0.82rem] text-gray-500">Fără date de plată</span>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Donut chart — 120x120 */}
          <div className="shrink-0">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend list with progress bars */}
          <div className="flex-1 flex flex-col gap-2.5">
            {entries.map(([metoda, count], i) => {
              const cfg = METODA_CONFIG[metoda] ?? METODA_CONFIG.other!;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              const color = METODA_COLORS[i % METODA_COLORS.length]!;
              const Icon = cfg.icon;

              return (
                <div key={metoda} className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
                      <Icon className="h-3 w-3 text-gray-500" />
                      <span className="text-[0.75rem] text-gray-300">{cfg.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.68rem] text-gray-500">{count} tx</span>
                      <span className="text-[0.72rem] font-medium text-white">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CategoryGrid
// ============================================================================

function CategoryGrid(): React.JSX.Element {
  // Category data: graceful mock — plati table has no category column
  return (
    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-5">
      <h3 className="mb-4 text-[0.93rem] font-semibold text-white">Pe Categorii</h3>
      <div className="grid grid-cols-2 gap-3">
        {MOCK_CATEGORIES.map((cat, i) => {
          const pct = cat.target > 0 ? Math.round((cat.colectat / cat.target) * 100) : 0;
          return (
            <div key={cat.name} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="truncate text-[0.72rem] text-gray-300">{cat.name}</span>
                <span className="ml-1 shrink-0 text-[0.65rem] text-gray-500">{pct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: cat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.4 + i * 0.06, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between text-[0.65rem] text-gray-500">
                <span>{cat.colectat.toLocaleString("ro-RO")} RON</span>
                <span>{cat.target.toLocaleString("ro-RO")} RON target</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// RevenueCharts — main export (composes all 4 chart sections)
// ============================================================================

export function RevenueCharts({
  monthlyData,
  dailyData,
  metodaData,
}: RevenueChartsProps): React.JSX.Element {
  return (
    <div className="space-y-5">
      {/* Top row: AreaChart + BarChart */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <RevenueAreaChart data={monthlyData} />
        <DailyVolumeBarChart data={dailyData} />
      </div>

      {/* Bottom row: payment methods + category grid */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PaymentMethodsList data={metodaData} />
        <CategoryGrid />
      </div>
    </div>
  );
}
