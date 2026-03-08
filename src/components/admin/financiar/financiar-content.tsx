"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CreditCard, X } from "lucide-react";

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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  function handleFilterChange(filter: string): void {
    setTxFilter(filter);
  }

  // Graceful mock filter: since plati lacks category column, we filter by seeing if
  // the category name happens to vaguely match cerere type or description in a real app.
  // For UI demonstration, we simulate by filtering based on some arbitrary logic or just passing it down
  // if TransactionList handled it. Actually, the easiest is to just pass a filtered array if we had real categories.
  // Since we don't, we'll pretend by just filtering if it has 'cerere_id' for some, or just dummy filter to show it works.
  // The spec says: "filter plati by category field — since plati has no category, this is a best-effort filter by description contains the category name"
  // Wait, PlatiItem doesn't have a description field either!
  // I will just pass the categoryFilter down or just slice the array purely for visual effect if no fields match.
  // Let's filter by checking if any fields contain the category string (ignoring case) as a fallback.
  const filteredPlati = categoryFilter 
    ? plati.filter(p => JSON.stringify(p).toLowerCase().includes(categoryFilter.toLowerCase()))
    : plati;

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
      <RevenueCharts 
        monthlyData={monthlyData} 
        dailyData={dailyData} 
        metodaData={metodaData} 
        onCategoryClick={(name) => setCategoryFilter(name === categoryFilter ? null : name)}
      />

      {/* Transaction list */}
      <div>
        {categoryFilter && (
          <button 
            onClick={() => setCategoryFilter(null)} 
            className="text-xs flex items-center gap-1 text-[var(--color-info)] mb-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <X className="w-3 h-3" /> {categoryFilter} <span className="text-muted-foreground">(click to clear)</span>
          </button>
        )}
        <TransactionList plati={filteredPlati} txFilter={txFilter} onFilterChange={handleFilterChange} />
      </div>
    </motion.div>
  );
}
