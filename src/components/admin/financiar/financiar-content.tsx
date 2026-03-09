"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CircleDollarSign, Download } from "lucide-react";

import type { TxStatus } from "./financiar-data";
import { KpiCards } from "./kpi-cards";
import { RevenueCharts } from "./revenue-charts";
import { CategoryBreakdown } from "./category-breakdown";
import { DailyVolumeChart } from "./daily-volume-chart";
import { TransactionList } from "./transaction-list";
import { GatewayHealth } from "./gateway-health";

// ─── Preserved interface (unused props kept for compatibility) ──

export interface FinanciarContentProps {
  plati: unknown[];
  monthlyData: unknown[];
  dailyData: unknown[];
  metodaData: unknown;
  tipuriCereri: unknown[];
  totalRevenue: number;
}

// ─── Component ────────────────────────────────────────

export function FinanciarContent(_props: FinanciarContentProps) {
  const [txFilter, setTxFilter] = useState<TxStatus | "all">("all");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <CircleDollarSign className="h-6 w-6 text-emerald-400" /> Monitorizare Financiară
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-1 text-gray-600"
            style={{ fontSize: "0.83rem" }}
          >
            Urmărire plăți, rată succes, gateway health, tranzacții — Vizualizare Admin
          </motion.p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toast.success("Export raport generat")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-white transition-all hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: "0 4px 15px rgba(16,185,129,0.25)",
            }}
          >
            <Download className="h-4 w-4" />
            <span style={{ fontSize: "0.82rem" }}>Export Raport</span>
          </motion.button>
        </div>
      </div>

      <KpiCards />
      <RevenueCharts txFilter={txFilter} onFilterChange={setTxFilter} onPageReset={() => {}} />
      <CategoryBreakdown />
      <DailyVolumeChart />
      <TransactionList txFilter={txFilter} onFilterChange={setTxFilter} />
      <GatewayHealth />
    </div>
  );
}
