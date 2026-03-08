"use client";

import { motion } from "motion/react";
import {
  Wallet,
  Target,
  Receipt,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CheckCircle,
  Clock,
  RefreshCcw,
} from "lucide-react";
import { AnimatedCounter } from "@/components/admin/shared/animated-counter";

// ============================================================================
// Types
// ============================================================================

interface PlatiItem {
  id: string;
  suma: number;
  status: string;
  metoda_plata: string | null;
  created_at: string;
  cerere_id: string | null;
}

interface KpiCardsProps {
  plati: PlatiItem[];
  totalRevenue: number;
  txFilter: string;
  onFilterChange: (filter: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

/** Monthly target (mock — real target data not in plati table schema) */
const MONTH_TARGET = 210_000;

// ============================================================================
// KpiCards
// ============================================================================

export function KpiCards({
  plati,
  totalRevenue,
  txFilter,
  onFilterChange,
}: KpiCardsProps): React.JSX.Element {
  const totalTx = plati.length;
  const successTx = plati.filter((p) => p.status === "success").length;
  const failedTx = plati.filter((p) => p.status === "failed").length;
  const pendingTx = plati.filter((p) => p.status === "pending").length;
  const refundedTx = plati.filter((p) => p.status === "refunded").length;

  const successRate = totalTx > 0 ? Math.round((successTx / totalTx) * 1000) / 10 : 0;
  const failRate = totalTx > 0 ? Math.round((failedTx / totalTx) * 1000) / 10 : 0;
  const avgTxValue = successTx > 0 ? Math.round(totalRevenue / successTx) : 0;
  const targetProgress = Math.min(100, Math.round((totalRevenue / MONTH_TARGET) * 100));

  // ---- KPI card definitions ----
  const kpiCards = [
    {
      icon: Wallet,
      iconColor: "var(--color-success)",
      label: "Total colectat",
      value: totalRevenue,
      suffix: " RON",
      extraContent: (
        <div className="mt-2">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[0.65rem] text-gray-400">{targetProgress}% din target lunar</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-[var(--color-success)]"
              initial={{ width: 0 }}
              animate={{ width: `${targetProgress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </div>
        </div>
      ),
    },
    {
      icon: Target,
      iconColor: "var(--color-info)",
      label: "Target lunar",
      value: MONTH_TARGET,
      suffix: " RON",
      extraContent: null,
    },
    {
      icon: Receipt,
      iconColor: "var(--color-violet-500)",
      label: "Nr. tranzacții",
      value: totalTx,
      suffix: "",
      extraContent: null,
    },
    {
      icon: CheckCircle2,
      iconColor: "var(--color-success)",
      label: "Rată succes",
      value: Math.round(successRate * 10),
      suffix: "%",
      // Display tenths as formatted
      formatFn: (n: number) => `${(n / 10).toFixed(1)}`,
      extraContent: null,
    },
    {
      icon: XCircle,
      iconColor: "var(--color-error)",
      label: "Rată eșec",
      value: Math.round(failRate * 10),
      suffix: "%",
      formatFn: (n: number) => `${(n / 10).toFixed(1)}`,
      extraContent: null,
    },
    {
      icon: TrendingUp,
      iconColor: "var(--color-warning)",
      label: "Valoare medie",
      value: avgTxValue,
      suffix: " RON",
      extraContent: null,
    },
  ] as const;

  // ---- Mini status cards ----
  const miniCards = [
    {
      key: "success",
      icon: CheckCircle,
      label: "Succes",
      count: successTx,
      colorClass: "text-[var(--color-success)]",
      bgClass: "bg-[var(--color-success-subtle)] border-[var(--color-success)]/20",
    },
    {
      key: "pending",
      icon: Clock,
      label: "Pending",
      count: pendingTx,
      colorClass: "text-[var(--color-warning)]",
      bgClass: "bg-[var(--color-warning-subtle)] border-[var(--color-warning)]/20",
    },
    {
      key: "failed",
      icon: XCircle,
      label: "Eșuat",
      count: failedTx,
      colorClass: "text-[var(--color-error)]",
      bgClass: "bg-[var(--color-error-subtle)] border-[var(--color-error)]/20",
    },
    {
      key: "refunded",
      icon: RefreshCcw,
      label: "Rambursate",
      count: refundedTx,
      colorClass: "text-violet-400",
      bgClass: "bg-violet-500/10 border-violet-500/20",
    },
  ] as const;

  return (
    <div className="space-y-4">
      {/* 6 KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0" style={{ color: card.iconColor }} />
                <span className="truncate text-[0.7rem] text-gray-400">{card.label}</span>
              </div>
              <div className="flex items-baseline gap-0.5">
                {"formatFn" in card ? (
                  <AnimatedCounter
                    target={card.value as number}
                    formatFn={card.formatFn as (n: number) => string}
                    className="text-xl font-bold text-white"
                  />
                ) : (
                  <AnimatedCounter
                    target={card.value as number}
                    className="text-xl font-bold text-white"
                  />
                )}
                {card.suffix && <span className="text-xs text-gray-400">{card.suffix}</span>}
              </div>
              {card.extraContent}
            </motion.div>
          );
        })}
      </div>

      {/* 4 mini status filter cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {miniCards.map((mc, i) => {
          const Icon = mc.icon;
          const isActive = txFilter === mc.key;
          return (
            <motion.button
              key={mc.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.3 + i * 0.05 }}
              onClick={() => onFilterChange(isActive ? "all" : mc.key)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${mc.bgClass} ${isActive ? "ring-1 ring-white/20" : ""}`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${mc.colorClass}`} />
              <div>
                <div className="text-[0.65rem] text-gray-400">{mc.label}</div>
                <div className={`text-sm font-semibold ${mc.colorClass}`}>{mc.count}</div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
