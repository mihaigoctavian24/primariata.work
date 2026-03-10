"use client";

import { motion } from "framer-motion";
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
import { GlassTooltip } from "./glass-tooltip";

interface PlatformStatsChartsProps {
  cereriTrend: Record<string, string | number>[];
  topPrimarii: Record<string, string | number>[];
  revenueData: Record<string, string | number>[];
}

export function PlatformStatsCharts({
  cereriTrend,
  topPrimarii,
  revenueData,
}: PlatformStatsChartsProps) {
  return (
    <div className="mb-5 grid grid-cols-12 gap-5">
      {/* Cereri Trend */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="col-span-4 rounded-2xl p-5"
        style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
      >
        <h3 className="text-foreground mb-4 text-[0.95rem] font-semibold">Volum Cereri — 6 luni</h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={cereriTrend}>
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
              dataKey="cereri"
              name="Cereri"
              stroke="#10b981"
              strokeWidth={2}
              fill="rgba(16,185,129,0.12)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Primării */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-4 rounded-2xl p-5"
        style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
      >
        <h3 className="text-foreground mb-4 text-[0.95rem] font-semibold">
          Top Primării — volum cereri
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={topPrimarii} layout="vertical">
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

      {/* Revenue (MRR) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="col-span-4 rounded-2xl p-5"
        style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
      >
        <h3 className="text-foreground mb-4 text-[0.95rem] font-semibold">
          Revenue (MRR) — 6 luni
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={revenueData}>
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
              dataKey="revenue"
              name="MRR"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="rgba(245,158,11,0.12)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}

export function UserGrowthChart({ userGrowth }: { userGrowth: Record<string, string | number>[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="col-span-4 rounded-2xl p-5"
      style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
    >
      <h3 className="text-foreground mb-4 text-[0.95rem] font-semibold">
        Creștere Utilizatori / lună
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={userGrowth}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(6,182,212,0.06)" }} />
          <Bar
            dataKey="users"
            name="Utilizatori noi"
            fill="#06b6d4"
            radius={[4, 4, 0, 0]}
            barSize={24}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
