"use client";

import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";

import { dailyVolume, CustomTooltip } from "./financiar-data";

// ─── Component ────────────────────────────────────────

export function DailyVolumeChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mb-5 rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <h3 className="mb-4 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
        Volum Zilnic — Săptămâna Curentă
      </h3>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={dailyVolume}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#6b7280", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fill: "#6b7280", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            yAxisId="left"
            dataKey="tranzactii"
            name="Tranzacții"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
            barSize={24}
            opacity={0.8}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="valoare"
            name="Valoare"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: "#10b981", r: 3 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
