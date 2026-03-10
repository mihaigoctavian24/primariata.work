"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
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
  LineChart,
  Line,
} from "recharts";
import { GlassTooltip } from "./glass-tooltip";

// ─── Mock Data ───────────────────────────────────────
const cereriVolumeTrend = [
  { month: "Oct '25", total: 4820, premium: 3200, standard: 1200, basic: 420 },
  { month: "Nov '25", total: 5340, premium: 3550, standard: 1350, basic: 440 },
  { month: "Dec '25", total: 4120, premium: 2700, standard: 1080, basic: 340 },
  { month: "Ian '26", total: 6180, premium: 4100, standard: 1580, basic: 500 },
  { month: "Feb '26", total: 5890, premium: 3900, standard: 1520, basic: 470 },
  { month: "Mar '26", total: 6420, premium: 4250, standard: 1650, basic: 520 },
];

const topPrimarii = [
  { name: "Sector 1 B", cereri: 3420 },
  { name: "Cluj-Napoca", cereri: 2870 },
  { name: "Timișoara", cereri: 2340 },
  { name: "Iași", cereri: 1980 },
  { name: "Constanța", cereri: 1650 },
  { name: "Brașov", cereri: 1420 },
  { name: "Oradea", cereri: 1180 },
  { name: "Craiova", cereri: 980 },
  { name: "Sibiu", cereri: 120 },
  { name: "Ploiești", cereri: 340 },
];

const userGrowthDetailed = [
  { month: "Oct '25", cetateni: 2100, functionari: 120, primari: 8, admini: 10 },
  { month: "Nov '25", cetateni: 2350, functionari: 135, primari: 9, admini: 10 },
  { month: "Dec '25", cetateni: 2480, functionari: 142, primari: 9, admini: 10 },
  { month: "Ian '26", cetateni: 2890, functionari: 165, primari: 10, admini: 11 },
  { month: "Feb '26", cetateni: 3210, functionari: 178, primari: 10, admini: 12 },
  { month: "Mar '26", cetateni: 3540, functionari: 192, primari: 10, admini: 13 },
];

const revenueTrend = [
  { month: "Oct '25", mrr: 11200, target: 12000 },
  { month: "Nov '25", mrr: 12100, target: 12500 },
  { month: "Dec '25", mrr: 11800, target: 13000 },
  { month: "Ian '26", mrr: 13400, target: 13500 },
  { month: "Feb '26", mrr: 13900, target: 14000 },
  { month: "Mar '26", mrr: 14500, target: 14500 },
];

const featureAdoption = [
  { feature: "AI Analysis", adoptionPct: 58, primarii: 7 },
  { feature: "Advanced Analytics", adoptionPct: 25, primarii: 3 },
  { feature: "Gamification", adoptionPct: 25, primarii: 3 },
  { feature: "Mobile App API", adoptionPct: 0, primarii: 0 },
  { feature: "Survey Platform", adoptionPct: 42, primarii: 5 },
];

const approvalRates = [
  { name: "Sector 1 B", rata: 92 },
  { name: "Cluj-Napoca", rata: 89 },
  { name: "Timișoara", rata: 85 },
  { name: "Iași", rata: 87 },
  { name: "Constanța", rata: 78 },
  { name: "Brașov", rata: 83 },
  { name: "Oradea", rata: 90 },
  { name: "Craiova", rata: 76 },
];

export function SaAnalyticsContent() {
  const [period, setPeriod] = useState<"6m" | "12m">("6m");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-foreground flex items-center gap-2"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <BarChart3 className="h-6 w-6 text-violet-400" /> Platform Analytics
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="text-muted-foreground mt-1"
            style={{ fontSize: "0.83rem" }}
          >
            Statistici agregate — toate primăriile · vizualizare globală
          </motion.p>
        </div>
        <div
          className="flex gap-1 rounded-xl p-1"
          style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
        >
          {(["6m", "12m"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`relative cursor-pointer rounded-lg px-4 py-1.5 transition-all ${period === p ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {period === p && (
                <motion.div
                  layoutId="analyticsPeriod"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.06))",
                    border: "1px solid rgba(139,92,246,0.12)",
                  }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10" style={{ fontSize: "0.82rem" }}>
                {p === "6m" ? "6 Luni" : "12 Luni"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 1 */}
      <div className="mb-5 grid grid-cols-12 gap-5">
        {/* Cereri Volume Trend */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-8 rounded-2xl p-5"
          style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-foreground" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
              Volum Cereri — Trend per Tier
            </h3>
            <div className="flex items-center gap-4">
              {[
                { label: "Premium", color: "#8b5cf6" },
                { label: "Standard", color: "#06b6d4" },
                { label: "Basic", color: "#6b7280" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-sm" style={{ background: l.color }} />
                  <span className="text-muted-foreground" style={{ fontSize: "0.68rem" }}>
                    {l.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={cereriVolumeTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area
                type="monotone"
                dataKey="premium"
                name="Premium"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="rgba(139,92,246,0.1)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="standard"
                name="Standard"
                stroke="#06b6d4"
                strokeWidth={2}
                fill="rgba(6,182,212,0.1)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="basic"
                name="Basic"
                stroke="#6b7280"
                strokeWidth={1.5}
                fill="rgba(107,114,128,0.08)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Feature Adoption */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-4 rounded-2xl p-5"
          style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
        >
          <h3 className="text-foreground mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Adopție Features
          </h3>
          <div className="space-y-4">
            {featureAdoption.map((f) => (
              <div key={f.feature}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-foreground" style={{ fontSize: "0.78rem" }}>
                    {f.feature}
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: "0.68rem" }}>
                    {f.primarii}/12 primării
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{ background: "var(--border-subtle)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.adoptionPct}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        f.adoptionPct > 40
                          ? "linear-gradient(90deg, #10b981, #06b6d4)"
                          : f.adoptionPct > 0
                            ? "linear-gradient(90deg, #f59e0b, #f97316)"
                            : "#374151",
                    }}
                  />
                </div>
                <div
                  className="mt-0.5 text-right"
                  style={{
                    fontSize: "0.65rem",
                    color: f.adoptionPct > 40 ? "#10b981" : "#6b7280",
                  }}
                >
                  {f.adoptionPct}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="mb-5 grid grid-cols-12 gap-5">
        {/* Revenue MRR */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-6 rounded-2xl p-5"
          style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
        >
          <h3 className="text-foreground mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Revenue — MRR vs Target
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Line
                type="monotone"
                dataKey="mrr"
                name="MRR"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#f59e0b" }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#6b7280"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User Growth by Role */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-6 rounded-2xl p-5"
          style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
        >
          <h3 className="text-foreground mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Creștere Utilizatori — per Rol
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthDetailed}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<GlassTooltip />} />
              <Area
                type="monotone"
                dataKey="cetateni"
                name="Cetățeni"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="rgba(59,130,246,0.1)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="functionari"
                name="Funcționari"
                stroke="#10b981"
                strokeWidth={2}
                fill="rgba(16,185,129,0.1)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-5">
        {/* Top Primării Bar */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-6 rounded-2xl p-5"
          style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
        >
          <h3 className="text-foreground mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Top 10 Primării — volum cereri total
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={[...topPrimarii].sort((a, b) => b.cereri - a.cereri)} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#6b7280", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: "#9ca3af", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(16,185,129,0.06)" }} />
              <Bar
                dataKey="cereri"
                name="Cereri"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
                barSize={14}
                isAnimationActive={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Approval Rate per Primărie */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-6 rounded-2xl p-5"
          style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
        >
          <h3 className="text-foreground mb-4" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Rată Aprobare Cereri — per Primărie
          </h3>
          <div className="space-y-3">
            {[...approvalRates]
              .sort((a, b) => b.rata - a.rata)
              .map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span
                    className="text-muted-foreground w-5 text-right"
                    style={{ fontSize: "0.68rem" }}
                  >
                    #{i + 1}
                  </span>
                  <span className="text-foreground w-24 truncate" style={{ fontSize: "0.78rem" }}>
                    {p.name}
                  </span>
                  <div
                    className="h-2 flex-1 overflow-hidden rounded-full"
                    style={{ background: "var(--border-subtle)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${p.rata}%` }}
                      transition={{ duration: 1, delay: i * 0.08, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background:
                          p.rata >= 85
                            ? "linear-gradient(90deg, #10b981, #06b6d4)"
                            : p.rata >= 75
                              ? "#f59e0b"
                              : "#ef4444",
                      }}
                    />
                  </div>
                  <span
                    className="w-10 text-right"
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: p.rata >= 85 ? "#10b981" : p.rata >= 75 ? "#f59e0b" : "#ef4444",
                    }}
                  >
                    {p.rata}%
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
