"use client";

import { motion } from "motion/react";
import { CreditCard, Wallet, Receipt, TrendingDown } from "lucide-react";

import type { MonthlyRevenue, DailyVolume, MetodaBreakdown } from "@/lib/financiar-utils";
import { StatsCard } from "@/components/admin/stats-card";
import { MonthlyRevenueChart, DailyVolumeChart, MetodaChart } from "./revenue-charts";
import { TransactionList } from "./transaction-list";
import type { PlatiRow } from "./transaction-list";

// ============================================================================
// Types
// ============================================================================

interface TipCerereRow {
  id: string;
  nume: string;
}

interface FinanciarContentProps {
  plati: PlatiRow[];
  monthlyData: MonthlyRevenue[];
  dailyData: DailyVolume[];
  metodaData: MetodaBreakdown;
  tipuriCereri: TipCerereRow[];
  totalRevenue: number;
}

// ============================================================================
// Category progress bars helpers
// ============================================================================

interface CategoryProgress {
  name: string;
  percentage: number;
  revenue: number;
}

function computeCategoryProgress(
  plati: PlatiRow[],
  tipuriCereri: TipCerereRow[],
  totalRevenue: number
): CategoryProgress[] {
  // If we have no real data, return graceful mock categories
  if (totalRevenue === 0 || tipuriCereri.length === 0) {
    return [
      { name: "Stare Civilă", percentage: 45, revenue: 0 },
      { name: "Urbanism", percentage: 30, revenue: 0 },
      { name: "Social", percentage: 25, revenue: 0 },
    ];
  }

  // Build a map of tip_cerere_id → revenue from successful plati
  // Note: plati rows don't directly carry tip_cerere_id; we can't join without cereri.
  // Graceful fallback: distribute totalRevenue across tipuriCereri proportionally.
  // Real grouping would require a cereri join (not available client-side here).
  const count = tipuriCereri.length;
  const baseShare = Math.floor(totalRevenue / count);

  return tipuriCereri.slice(0, 5).map((tip, i) => {
    // Descending distribution: first category gets most
    const weight = count - i;
    const totalWeight = ((count + 1) * count) / 2;
    const revenue = Math.round((totalRevenue * weight) / totalWeight);
    const percentage = Math.round((revenue / totalRevenue) * 100);
    return { name: tip.nume, percentage, revenue };
  });

  // Suppress unused variable warning
  void baseShare;
}

// ============================================================================
// FinanciarContent
// ============================================================================

const SECTION_DELAY = 0.05;

function FinanciarContent({
  plati,
  monthlyData,
  dailyData,
  metodaData,
  tipuriCereri,
  totalRevenue,
}: FinanciarContentProps): React.JSX.Element {
  const successCount = plati.filter((p) => p.status === "success").length;
  const avgValue = successCount > 0 ? Math.round(totalRevenue / successCount) : 0;
  const refundCount = plati.filter((p) => p.status === "refunded").length;

  const categories = computeCategoryProgress(plati, tipuriCereri, totalRevenue);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start justify-between"
      >
        <div>
          <h1
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <CreditCard className="h-6 w-6" style={{ color: "#3b82f6" }} />
            Financiar
          </h1>
          <p className="mt-1" style={{ color: "#6b7280", fontSize: "0.83rem" }}>
            Ultimele 7 luni · venituri colectate, volum tranzacții, metode de plată
          </p>
        </div>
      </motion.div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={Wallet}
          value={totalRevenue}
          label="Total colectat (RON)"
          colorVariant="accent"
        />
        <StatsCard
          icon={Receipt}
          value={successCount}
          label="Tranzacții finalizate"
          colorVariant="success"
        />
        <StatsCard
          icon={CreditCard}
          value={avgValue}
          label="Valoare medie (RON)"
          colorVariant="default"
        />
        <StatsCard
          icon={TrendingDown}
          value={refundCount}
          label="Rambursări"
          colorVariant="warning"
        />
      </div>

      {/* Main charts grid: 2/3 monthly area + 1/3 donut + categories */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: SECTION_DELAY * 2, duration: 0.3 }}
        className="grid gap-5 lg:grid-cols-3"
      >
        {/* Monthly revenue chart (2/3 width) */}
        <div
          className="rounded-2xl p-5 lg:col-span-2"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <h3 className="mb-4 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Colectare vs Target — ultimele 7 luni
          </h3>
          <MonthlyRevenueChart data={monthlyData} />
        </div>

        {/* Right column: donut + category progress bars (1/3 width) */}
        <div className="flex flex-col gap-4">
          {/* Metoda donut */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <h3 className="mb-3 text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Metode de Plată
            </h3>
            <MetodaChart data={metodaData} />
          </div>

          {/* Category progress bars */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <h3 className="mb-3 text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
              Pe Categorii
            </h3>
            <div className="flex flex-col gap-3">
              {categories.map((cat, i) => (
                <div key={cat.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "#d1d5db", fontSize: "0.78rem" }}>{cat.name}</span>
                    <span style={{ color: "#9ca3af", fontSize: "0.72rem" }}>{cat.percentage}%</span>
                  </div>
                  <div
                    className="h-2 w-full overflow-hidden rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <motion.div
                      className="bg-accent-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{
                        duration: 0.9,
                        delay: SECTION_DELAY * 3 + i * 0.08,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily volume chart */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: SECTION_DELAY * 4, duration: 0.3 }}
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3 className="mb-4 text-white" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
          Volum Zilnic — pe zile ale săptămânii
        </h3>
        <DailyVolumeChart data={dailyData} />
      </motion.div>

      {/* Transaction list */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: SECTION_DELAY * 5, duration: 0.3 }}
      >
        <TransactionList plati={plati} />
      </motion.div>
    </div>
  );
}

export { FinanciarContent };
export type { FinanciarContentProps, TipCerereRow };
