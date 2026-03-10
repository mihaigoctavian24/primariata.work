"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FileText,
  Star,
  Clock,
  LayoutGrid,
  Table2,
  TrendingUp,
  TrendingDown,
  Crown,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PrimarDashboardData, DepartamentRow, ProiectRow } from "@/actions/primar-actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PrimarDashboardContentProps {
  initialData: { success: boolean; data?: PrimarDashboardData; error?: string };
}

// ─── Status badge configs ─────────────────────────────────────────────────────

const PROIECT_STATUS_CONFIG: Record<
  ProiectRow["status"],
  { label: string; color: string; bg: string }
> = {
  in_derulare: {
    label: "În derulare",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.10)",
  },
  planificat: {
    label: "Planificat",
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.10)",
  },
  finalizat: {
    label: "Finalizat",
    color: "#10b981",
    bg: "rgba(16,185,129,0.10)",
  },
  intarziat: {
    label: "Întârziat",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.10)",
  },
};

// ─── Glassmorphism Tooltip ────────────────────────────────────────────────────

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface GlassTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function GlassTooltip({ active, payload, label }: GlassTooltipProps): React.ReactElement | null {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5"
      style={{
        background: "rgba(20,20,36,0.85)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {label && (
        <div className="mb-1 text-gray-400" style={{ fontSize: "0.68rem" }}>
          {label}
        </div>
      )}
      {payload.map((p) => (
        <div
          key={p.name}
          className="mb-0.5 flex items-center gap-2"
          style={{ fontSize: "0.78rem" }}
        >
          <span className="h-2 w-2 rounded-sm" style={{ background: p.color }} />
          <span className="text-gray-400">Cereri:</span>
          <span className="text-white" style={{ fontWeight: 600 }}>
            {p.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Departament Card (grid view) ─────────────────────────────────────────────

function DepartamentCard({ dept }: { dept: DepartamentRow }): React.ReactElement {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-white">{dept.nume}</p>
        <span className="shrink-0 text-xs text-gray-500">{dept.nr_functionari} func.</span>
      </div>
      {dept.sef && <p className="mb-3 text-xs text-gray-500">Șef: {dept.sef}</p>}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          Buget: <span className="text-white">{dept.buget_alocat.toLocaleString("ro-RO")} RON</span>
        </span>
      </div>
    </div>
  );
}

// ─── Departament Row (table view) ─────────────────────────────────────────────

function DepartamentTableRow({ dept }: { dept: DepartamentRow }): React.ReactElement {
  return (
    <tr className="border-b border-white/[0.04] text-sm last:border-0">
      <td className="py-2 pr-4 text-white">{dept.nume}</td>
      <td className="py-2 pr-4 text-gray-400">{dept.sef ?? "—"}</td>
      <td className="py-2 pr-4 text-right text-gray-300">{dept.nr_functionari}</td>
      <td className="py-2 text-right text-gray-300">
        {dept.buget_alocat.toLocaleString("ro-RO")} RON
      </td>
    </tr>
  );
}

// ─── Proiect Row ──────────────────────────────────────────────────────────────

function ProiectRow({ proiect }: { proiect: ProiectRow }): React.ReactElement {
  const cfg = PROIECT_STATUS_CONFIG[proiect.status];
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{proiect.nume}</p>
          {proiect.responsabil && <p className="text-xs text-gray-500">{proiect.responsabil}</p>}
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>
      {/* Progress bar */}
      <div className="mb-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, proiect.progres_pct))}%`,
            background: "linear-gradient(90deg, #f59e0b, #d97706)",
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{proiect.progres_pct}% completat</span>
        <span>
          {proiect.buget_consumat.toLocaleString("ro-RO")} / {proiect.buget.toLocaleString("ro-RO")}{" "}
          RON
        </span>
      </div>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trendUp?: boolean;
  trendLabel?: string;
  delay?: number;
}

function KpiCard({
  icon,
  label,
  value,
  trendUp,
  trendLabel,
  delay = 0,
}: KpiCardProps): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          {icon}
        </div>
        {trendLabel !== undefined && (
          <div
            className="flex items-center gap-1 text-xs"
            style={{ color: trendUp ? "#10b981" : "#ef4444" }}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trendLabel}</span>
          </div>
        )}
      </div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-sm text-gray-400">{label}</div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PrimarDashboardContent({
  initialData,
}: PrimarDashboardContentProps): React.ReactElement {
  const [deptView, setDeptView] = useState<"grid" | "table">("grid");

  // Error state
  if (!initialData.success) {
    return (
      <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Eroare la încărcarea datelor. Încearcă să recarci pagina.</span>
        </div>
      </div>
    );
  }

  const data = initialData.data!;

  // ─── Section 1: Header ─────────────────────────────────────────────────────
  const dateLabel = new Date().toLocaleDateString("ro-RO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))",
              border: "1px solid rgba(245,158,11,0.15)",
            }}
          >
            <Crown className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Panou de comandă</h1>
            <p className="text-sm text-gray-400">Primar — vizualizare globală primărie</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-gray-400 sm:block"
        >
          {dateLabel}
        </motion.div>
      </div>

      {/* ─── Section 2: KPI Cards ─────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          icon={<Users className="h-4 w-4 text-amber-400" />}
          label="Funcționari"
          value={data.functionariCount.toString()}
          trendUp={true}
          trendLabel="+2"
          delay={0}
        />
        <KpiCard
          icon={<FileText className="h-4 w-4 text-amber-400" />}
          label="Cereri luna aceasta"
          value={data.cereriLuna.toString()}
          trendUp={true}
          trendLabel="+12%"
          delay={0.05}
        />
        <KpiCard
          icon={<Activity className="h-4 w-4 text-amber-400" />}
          label="Total cereri"
          value={data.cereriTotal.toString()}
          delay={0.1}
        />
        <KpiCard
          icon={<Star className="h-4 w-4 text-amber-400" />}
          label="Satisfacție"
          value={`${data.satisfactiePct.toFixed(1)}%`}
          trendUp={data.satisfactiePct >= 70}
          trendLabel={data.satisfactiePct >= 70 ? "bun" : "scăzut"}
          delay={0.15}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4 text-amber-400" />}
          label="Timp mediu rezolvare"
          value={`${data.timpMediu.toFixed(1)} zile`}
          trendUp={data.timpMediu <= 3}
          trendLabel={data.timpMediu <= 3 ? "rapid" : "lent"}
          delay={0.2}
        />
      </div>

      {/* ─── Section 3: Chart + Departamente ─────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* AreaChart: 6-month cereri trend */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Tendință cereri — 6 luni</h2>
          <ResponsiveContainer width="100%" height={256}>
            <AreaChart
              data={data.cereriByMonth}
              margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="cereriGrad23" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="luna"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => {
                  const parts = v.split("-");
                  const monthIdx = parseInt(parts[1] ?? "0", 10) - 1;
                  const months = [
                    "Ian",
                    "Feb",
                    "Mar",
                    "Apr",
                    "Mai",
                    "Iun",
                    "Iul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ];
                  return months[monthIdx] ?? v;
                }}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Cereri"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#cereriGrad23)"
                dot={false}
                activeDot={{ r: 4, fill: "#f59e0b", stroke: "#d97706", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Departamente section */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Departamente</h2>
            <div className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.02] p-1">
              <button
                onClick={() => setDeptView("grid")}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors"
                style={
                  deptView === "grid"
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))",
                        color: "#f59e0b",
                      }
                    : { color: "#6b7280" }
                }
                title="Vizualizare grilă"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setDeptView("table")}
                className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md transition-colors"
                style={
                  deptView === "table"
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))",
                        color: "#f59e0b",
                      }
                    : { color: "#6b7280" }
                }
                title="Vizualizare tabel"
              >
                <Table2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {data.departamente.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-500">
              Nicio intrare
            </div>
          ) : deptView === "grid" ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.departamente.map((dept) => (
                <DepartamentCard key={dept.id} dept={dept} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left text-xs text-gray-500">
                    <th className="pr-4 pb-2 font-medium">Departament</th>
                    <th className="pr-4 pb-2 font-medium">Șef</th>
                    <th className="pr-4 pb-2 text-right font-medium">Func.</th>
                    <th className="pb-2 text-right font-medium">Buget</th>
                  </tr>
                </thead>
                <tbody>
                  {data.departamente.map((dept) => (
                    <DepartamentTableRow key={dept.id} dept={dept} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Section 4: Proiecte ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold text-white">Proiecte active (top 5)</h2>
        {data.proiecte.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-gray-500">
            Nicio intrare
          </div>
        ) : (
          <div className="space-y-3">
            {data.proiecte.map((proiect) => (
              <ProiectRow key={proiect.id} proiect={proiect} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
