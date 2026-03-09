"use client";

import { motion } from "motion/react";
import {
  Activity,
  Target,
  Gauge,
  Timer,
  PauseCircle,
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { DonutChart } from "@/components/admin/shared/donut-chart";

import type { Cerere, CereriStats, CerereStatus, TabView } from "./cereri-data";
import { statusConfig, functionariList, trendData, ChartTooltip } from "./cereri-data";

// ─── Props ────────────────────────────────────────────

interface CereriOverviewProps {
  cereri: Cerere[];
  stats: CereriStats;
  alerts: Cerere[];
  onSwitchTab: (tab: TabView) => void;
}

// ─── Component ────────────────────────────────────────

export function CereriOverview({ cereri, stats, alerts, onSwitchTab }: CereriOverviewProps) {
  const donutData = Object.entries(stats.byStatus).map(([key, val]) => ({
    name: statusConfig[key as CerereStatus]?.label || key,
    value: val,
    color: statusConfig[key as CerereStatus]?.color || "#666",
  }));
  const workloadData = functionariList.map((f) => ({
    name: f.name.split(" ")[0],
    cereri: stats.byFunctionar[f.name] || 0,
    active: cereri.filter(
      (c) => c.functionar === f.name && !["aprobata", "respinsa"].includes(c.status)
    ).length,
  }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-5 grid grid-cols-6 gap-3">
        {[
          {
            label: "Cereri Active",
            value: stats.active,
            icon: Activity,
            color: "#3b82f6",
            sub: `din ${stats.total} total`,
          },
          {
            label: "Rata Aprobare",
            value: `${stats.rataAprobare}%`,
            icon: Target,
            color: "#10b981",
            sub: `${stats.aprobate} aprobate`,
          },
          {
            label: "SLA Compliance",
            value: `${stats.slaCompliance}%`,
            icon: Gauge,
            color:
              stats.slaCompliance >= 90
                ? "#10b981"
                : stats.slaCompliance >= 70
                  ? "#f59e0b"
                  : "#ef4444",
            sub: `${stats.slaBreach} incalcari`,
          },
          { label: "Timp Mediu", value: "3.2z", icon: Timer, color: "#8b5cf6", sub: "per cerere" },
          {
            label: "Blocate",
            value: stats.blocate,
            icon: PauseCircle,
            color: stats.blocate > 0 ? "#ef4444" : "#6b7280",
            sub: stats.blocate > 0 ? "necesita atentie!" : "totul ok",
          },
          {
            label: "Nealocate",
            value: stats.nealocate,
            icon: Users,
            color: stats.nealocate > 0 ? "#f59e0b" : "#6b7280",
            sub: stats.nealocate > 0 ? "asteapta alocare" : "toate alocate",
          },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="rounded-xl p-3.5"
              style={{ background: `${kpi.color}08`, border: `1px solid ${kpi.color}15` }}
            >
              <div className="mb-2 flex items-center justify-between">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: `${kpi.color}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div
                className="text-white"
                style={{ fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.1 }}
              >
                {kpi.value}
              </div>
              <div className="mt-0.5 text-gray-500" style={{ fontSize: "0.72rem" }}>
                {kpi.label}
              </div>
              <div className="mt-0.5 text-gray-600" style={{ fontSize: "0.65rem" }}>
                {kpi.sub}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mb-5 grid grid-cols-12 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-5 rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
              Trend Cereri (14 zile)
            </h3>
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1 text-blue-400"
                style={{ fontSize: "0.65rem" }}
              >
                <span className="h-1 w-2 rounded bg-blue-500" /> Depuse
              </span>
              <span
                className="flex items-center gap-1 text-emerald-400"
                style={{ fontSize: "0.65rem" }}
              >
                <span className="h-1 w-2 rounded bg-emerald-500" /> Rezolvate
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gradDepuse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradRezolvate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="zi"
                tick={{ fill: "#4b5563", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4b5563", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={25}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "rgba(139,92,246,0.15)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="depuse"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gradDepuse)"
              />
              <Area
                type="monotone"
                dataKey="rezolvate"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#gradRezolvate)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-3 flex flex-col items-center rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3
            className="mb-2 self-start text-white"
            style={{ fontSize: "0.88rem", fontWeight: 600 }}
          >
            Distributie Status
          </h3>
          <DonutChart
            data={donutData}
            size={150}
            centerValue={stats.total}
            centerLabel="Total Cereri"
          />
          <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {donutData.map((p) => (
              <span
                key={p.name}
                className="flex items-center gap-1"
                style={{ fontSize: "0.62rem", color: p.color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />{" "}
                {p.name} ({p.value})
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-4 rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
              Workload Functionari
            </h3>
            <div className="flex items-center gap-3">
              <span
                className="flex items-center gap-1 text-violet-400"
                style={{ fontSize: "0.65rem" }}
              >
                <span className="h-1 w-2 rounded bg-violet-500" /> Total
              </span>
              <span
                className="flex items-center gap-1 text-pink-400"
                style={{ fontSize: "0.65rem" }}
              >
                <span className="h-1 w-2 rounded bg-pink-500" /> Active
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={workloadData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "#4b5563", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#4b5563", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={20}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(139,92,246,0.06)" }} />
              <Bar dataKey="cereri" fill="#8b5cf680" radius={[4, 4, 0, 0]} />
              <Bar dataKey="active" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-5 flex items-center gap-3 rounded-xl p-3"
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(245,158,11,0.06))",
            border: "1px solid rgba(239,68,68,0.15)",
          }}
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "rgba(239,68,68,0.15)" }}
          >
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              {alerts.length} cereri necesita atentie
            </div>
            <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>
              {stats.slaBreach > 0 && `${stats.slaBreach} SLA depasit · `}
              {stats.blocate > 0 && `${stats.blocate} blocate · `}
              {stats.nealocate > 0 && `${stats.nealocate} nealocate`}
            </div>
          </div>
          <button
            onClick={() => onSwitchTab("alerts")}
            className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-red-400 transition-all hover:text-white"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.15)",
              fontSize: "0.82rem",
            }}
          >
            <Eye className="h-3.5 w-3.5" /> Vezi Alerte
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="mb-3 text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
            SLA Health — Cereri Active
          </h3>
          <div className="flex flex-col gap-2">
            {[
              { label: "Depasit SLA", count: stats.slaBreach, color: "#ef4444", icon: XCircle },
              {
                label: "SLA < 3 zile",
                count: stats.slaWarning,
                color: "#f59e0b",
                icon: AlertTriangle,
              },
              {
                label: "SLA OK (> 3 zile)",
                count: stats.active - stats.slaBreach - stats.slaWarning,
                color: "#10b981",
                icon: CheckCircle2,
              },
            ].map((row) => {
              const Icon = row.icon;
              const pct = stats.active > 0 ? Math.round((row.count / stats.active) * 100) : 0;
              return (
                <div key={row.label} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: row.color }} />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-gray-300" style={{ fontSize: "0.78rem" }}>
                        {row.label}
                      </span>
                      <span style={{ fontSize: "0.78rem", color: row.color, fontWeight: 600 }}>
                        {row.count} ({pct}%)
                      </span>
                    </div>
                    <div
                      className="h-1.5 w-full rounded-full"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: row.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-4"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="mb-3 text-white" style={{ fontSize: "0.88rem", fontWeight: 600 }}>
            Per Departament
          </h3>
          <div className="flex flex-col gap-1.5">
            {Object.entries(stats.byDept)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([dept, count]) => {
                const pct = Math.round((count / stats.total) * 100);
                return (
                  <div key={dept} className="flex items-center gap-3">
                    <span className="w-24 truncate text-gray-400" style={{ fontSize: "0.75rem" }}>
                      {dept}
                    </span>
                    <div
                      className="h-1.5 flex-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
                        }}
                      />
                    </div>
                    <span className="w-10 text-right text-gray-500" style={{ fontSize: "0.72rem" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
