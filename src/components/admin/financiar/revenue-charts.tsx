"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Clock, XCircle, RefreshCcw } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from "recharts";

import type { TxStatus } from "./financiar-data";
import { allTransactions, monthlyRevenue, paymentMethods, CustomTooltip } from "./financiar-data";

// ─── Props ────────────────────────────────────────────

interface RevenueChartsProps {
  txFilter: TxStatus | "all";
  onFilterChange: (filter: TxStatus | "all") => void;
  onPageReset: () => void;
}

// ─── Component ────────────────────────────────────────

export function RevenueCharts({ txFilter, onFilterChange, onPageReset }: RevenueChartsProps) {
  const [chartPeriod, setChartPeriod] = useState<"6m" | "1y">("6m");

  const totalTx = allTransactions.length;
  const successTx = allTransactions.filter((t) => t.status === "success").length;
  const failedTx = allTransactions.filter((t) => t.status === "failed").length;
  const pendingTx = allTransactions.filter((t) => t.status === "pending").length;
  const refundedTx = allTransactions.filter((t) => t.status === "refunded").length;

  const statusToKey = (label: string): TxStatus =>
    label === "Succes"
      ? "success"
      : label === "Pending"
        ? "pending"
        : label === "Eșuate"
          ? "failed"
          : "refunded";

  const statusCards = [
    { label: "Succes", count: successTx, color: "#10b981", icon: CheckCircle2 },
    { label: "Pending", count: pendingTx, color: "#f59e0b", icon: Clock },
    { label: "Eșuate", count: failedTx, color: "#ef4444", icon: XCircle },
    { label: "Rambursate", count: refundedTx, color: "#8b5cf6", icon: RefreshCcw },
  ];

  return (
    <div className="mb-5 grid grid-cols-12 gap-5">
      {/* Tx Status Mini Cards */}
      <div className="col-span-3 flex flex-col gap-3">
        {statusCards.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            whileHover={{ x: 3 }}
            onClick={() => {
              onFilterChange(txFilter === statusToKey(s.label) ? "all" : statusToKey(s.label));
              onPageReset();
            }}
            className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-all"
            style={{ background: `${s.color}06`, border: `1px solid ${s.color}12` }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: `${s.color}15` }}
            >
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <div className="flex-1">
              <div className="text-gray-400" style={{ fontSize: "0.72rem" }}>
                {s.label}
              </div>
              <div
                className="text-white"
                style={{ fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.1 }}
              >
                {s.count}
              </div>
            </div>
            <div className="text-right">
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: s.color }}>
                {Math.round((s.count / totalTx) * 100)}%
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="col-span-5 rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Colectare vs Target
          </h3>
          <div
            className="flex gap-1 rounded-lg p-0.5"
            style={{ background: "rgba(255,255,255,0.04)" }}
          >
            {(["6m", "1y"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                className={`cursor-pointer rounded-md px-3 py-1 transition-all ${chartPeriod === p ? "text-white" : "text-gray-500"}`}
                style={
                  chartPeriod === p
                    ? { background: "rgba(16,185,129,0.2)", fontSize: "0.75rem" }
                    : { fontSize: "0.75rem" }
                }
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="finGreenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="colectat"
              name="Colectat"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#finGreenGrad)"
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="#3b82f680"
              strokeWidth={1.5}
              strokeDasharray="5 5"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="esuat"
              name="Eșuat"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="rgba(239,68,68,0.05)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Payment Methods */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-4 rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3 className="mb-4 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
          Metode de Plată
        </h3>
        <div className="flex flex-col gap-2.5">
          {paymentMethods.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className="flex items-center gap-3"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${m.color}12` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color: m.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="truncate text-gray-300" style={{ fontSize: "0.78rem" }}>
                      {m.name}
                    </span>
                    <span
                      className="shrink-0 text-white"
                      style={{ fontSize: "0.78rem", fontWeight: 600 }}
                    >
                      {m.value}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                      className="h-full rounded-full"
                      style={{ background: m.color }}
                    />
                  </div>
                  <span className="text-gray-600" style={{ fontSize: "0.65rem" }}>
                    {m.count} tranzacții
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
