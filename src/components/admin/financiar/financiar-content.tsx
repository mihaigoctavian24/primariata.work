"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CreditCard } from "lucide-react";

import type { MonthlyRevenueExtended, DailyVolume, MetodaBreakdown } from "@/lib/financiar-utils";
import { KpiCards } from "./kpi-cards";
import { RevenueCharts } from "./revenue-charts";
import { TransactionList } from "./transaction-list";

// ============================================================================
// Types
// ============================================================================

interface TipCerereRow {
  id: string;
  nume: string;
}

interface PlatiItem {
  id: string;
  suma: number;
  status: string;
  metoda_plata: string | null;
  created_at: string;
  cerere_id: string | null;
}

export interface FinanciarContentProps {
  plati: PlatiItem[];
  monthlyData: MonthlyRevenueExtended[];
  dailyData: DailyVolume[];
  metodaData: MetodaBreakdown;
  tipuriCereri: TipCerereRow[];
  totalRevenue: number;
}

// ============================================================================
// FinanciarContent
// ============================================================================

export function FinanciarContent({
  plati,
  monthlyData,
  dailyData,
  metodaData,
  totalRevenue,
}: FinanciarContentProps): React.JSX.Element {
  // Shared filter state — synced between KpiCards mini-cards and TransactionList
  const [txFilter, setTxFilter] = useState<string>("all");

  function handleFilterChange(filter: string): void {
    setTxFilter(filter);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <CreditCard className="h-6 w-6 text-blue-400" />
            Financiar
          </h1>
          <p className="mt-1 text-[0.83rem] text-gray-400">
            {totalRevenue.toLocaleString("ro-RO")} RON colectat · ultimele 7 luni
          </p>
        </div>
      </div>

      {/* 6 KPI cards + 4 mini status filter cards */}
      <KpiCards
        plati={plati}
        totalRevenue={totalRevenue}
        txFilter={txFilter}
        onFilterChange={handleFilterChange}
      />

      {/* Revenue charts: AreaChart + BarChart + payment methods + category grid */}
      <RevenueCharts monthlyData={monthlyData} dailyData={dailyData} metodaData={metodaData} />

      {/* Transaction list */}
      <div>
        <TransactionList plati={plati} txFilter={txFilter} onFilterChange={handleFilterChange} />
      </div>
    </motion.div>
  );
}
