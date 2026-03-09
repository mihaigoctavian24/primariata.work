"use client";

import { motion } from "motion/react";
import {
  Wallet,
  Target,
  Receipt,
  Percent,
  AlertTriangle,
  BanknoteIcon,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

import { allTransactions, MONTH_TARGET, CURRENT_MONTH_COLLECTED } from "./financiar-data";

// ─── Component ────────────────────────────────────────

export function KpiCards() {
  const totalTx = allTransactions.length;
  const successTx = allTransactions.filter((t) => t.status === "success").length;
  const failedTx = allTransactions.filter((t) => t.status === "failed").length;
  const successRate = Math.round((successTx / totalTx) * 100 * 10) / 10;
  const failRate = Math.round((failedTx / totalTx) * 100 * 10) / 10;
  const totalCollected = allTransactions
    .filter((t) => t.status === "success")
    .reduce((s, t) => s + t.amount, 0);
  const avgTxValue = Math.round(totalCollected / successTx);
  const targetProgress = Math.round((CURRENT_MONTH_COLLECTED / MONTH_TARGET) * 100);

  const cards = [
    {
      icon: Wallet,
      label: "Colectat Luna",
      value: CURRENT_MONTH_COLLECTED,
      suffix: "RON",
      color: "#10b981",
      trend: "+12.3%",
      up: true,
    },
    {
      icon: Target,
      label: "Target Lunar",
      value: MONTH_TARGET,
      suffix: "RON",
      color: "#3b82f6",
      trend: `${targetProgress}%`,
      up: targetProgress >= 50,
    },
    {
      icon: Receipt,
      label: "Nr. Tranzacții",
      value: totalTx,
      suffix: "",
      color: "#8b5cf6",
      trend: "+18",
      up: true,
    },
    {
      icon: Percent,
      label: "Rată Succes",
      value: successRate,
      suffix: "%",
      color: "#10b981",
      trend: "+2.1%",
      up: true,
    },
    {
      icon: AlertTriangle,
      label: "Rată Eșec",
      value: failRate,
      suffix: "%",
      color: "#ef4444",
      trend: "-0.8%",
      up: false,
    },
    {
      icon: BanknoteIcon,
      label: "Val. Medie Tx",
      value: avgTxValue,
      suffix: "RON",
      color: "#f59e0b",
      trend: "+5%",
      up: true,
    },
  ];

  return (
    <>
      {/* KPI Cards Row */}
      <div className="mb-5 grid grid-cols-6 gap-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.04 }}
            whileHover={{ y: -2 }}
            className="group cursor-pointer rounded-xl p-3.5"
            style={{ background: `${card.color}06`, border: `1px solid ${card.color}10` }}
          >
            <div className="mb-2 flex items-center justify-between">
              <card.icon className="h-4 w-4" style={{ color: card.color }} />
              <div
                className="flex items-center gap-0.5 rounded px-1.5 py-0.5"
                style={{ background: card.up ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}
              >
                {card.up ? (
                  <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
                ) : (
                  <TrendingDown className="h-2.5 w-2.5 text-red-400" />
                )}
                <span style={{ fontSize: "0.6rem", color: card.up ? "#10b981" : "#ef4444" }}>
                  {card.trend}
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-white"
                style={{ fontSize: "1.35rem", fontWeight: 700, lineHeight: 1.1 }}
              >
                {card.value.toLocaleString("ro-RO")}
              </span>
              {card.suffix && (
                <span className="text-gray-600" style={{ fontSize: "0.65rem" }}>
                  {card.suffix}
                </span>
              )}
            </div>
            <span className="mt-0.5 block text-gray-600" style={{ fontSize: "0.68rem" }}>
              {card.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Target Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-5 flex items-center gap-4 rounded-xl px-5 py-3.5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Target className="h-5 w-5 shrink-0 text-blue-400" />
        <div className="flex-1">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-gray-300" style={{ fontSize: "0.82rem" }}>
              Progres Target Martie:{" "}
              <span className="text-white" style={{ fontWeight: 600 }}>
                {CURRENT_MONTH_COLLECTED.toLocaleString("ro-RO")} RON
              </span>{" "}
              din {MONTH_TARGET.toLocaleString("ro-RO")} RON
            </span>
            <span className="text-white" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              {targetProgress}%
            </span>
          </div>
          <div
            className="h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${targetProgress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background:
                  targetProgress >= 80
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : targetProgress >= 50
                      ? "linear-gradient(90deg, #3b82f6, #6366f1)"
                      : "linear-gradient(90deg, #f59e0b, #ef4444)",
              }}
            />
          </div>
        </div>
        <span className="shrink-0 text-gray-500" style={{ fontSize: "0.72rem" }}>
          {Math.round((MONTH_TARGET - CURRENT_MONTH_COLLECTED) / 27).toLocaleString("ro-RO")} RON/zi
          necesar
        </span>
      </motion.div>
    </>
  );
}
