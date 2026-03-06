"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import type { DashboardStats } from "@/app/api/dashboard/stats/route";

interface ComparisonData {
  userValue: number;
  averageValue: number;
  unit?: string;
  lowerIsBetter?: boolean; // For metrics like "time to complete" where lower is better
}

interface StatisticsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  /** Optional comparison data (user vs media) */
  comparisonData?: {
    avgCompletionTime?: ComparisonData; // days
    approvalRate?: ComparisonData; // percentage
    usageFrequency?: ComparisonData; // requests per month
  };
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  delay: number;
  comparison?: ComparisonData;
}

function StatCard({ title, value, icon, color, delay, comparison }: StatCardProps) {
  // Dynamic font size based on value length
  const valueStr = String(value);
  const getFontSize = () => {
    if (valueStr.length <= 5) return "text-2xl"; // "32" or "100"
    if (valueStr.length <= 10) return "text-xl"; // "1,234" or "250.00 RON"
    return "text-lg"; // Very long values
  };

  // Calculate comparison status if data provided
  const getComparisonStatus = () => {
    if (!comparison) return null;

    const diff = comparison.userValue - comparison.averageValue;
    const percentDiff = (Math.abs(diff) / comparison.averageValue) * 100;

    // For "lower is better" metrics (e.g., time), reverse the logic
    const isBetter = comparison.lowerIsBetter
      ? comparison.userValue < comparison.averageValue
      : comparison.userValue > comparison.averageValue;

    const isEqual = Math.abs(percentDiff) < 5; // Within 5% is considered equal

    return {
      isBetter,
      isEqual,
      percentDiff: Math.round(percentDiff),
      icon: isEqual ? (
        <Minus className="h-3 w-3" />
      ) : isBetter ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      ),
      color: isEqual
        ? "text-muted-foreground"
        : isBetter
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400",
      bgColor: isEqual
        ? "bg-muted/50"
        : isBetter
          ? "bg-green-100 dark:bg-green-900/30"
          : "bg-red-100 dark:bg-red-900/30",
    };
  };

  const comparisonStatus = getComparisonStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-card border-border/40 rounded-lg border p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground mb-2 text-sm font-medium">{title}</p>
          <p className={`${getFontSize()} leading-tight font-bold tracking-tight break-words`}>
            {value}
          </p>

          {/* Comparison badge - user vs media */}
          {comparisonStatus && (
            <div className="mt-2 flex items-center gap-1">
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${comparisonStatus.bgColor} ${comparisonStatus.color}`}
              >
                {comparisonStatus.icon}
                <span>
                  {comparisonStatus.isEqual
                    ? "La medie"
                    : `${comparisonStatus.percentDiff}% vs medie`}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 rounded-lg p-2.5" style={{ backgroundColor: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </motion.div>
  );
}

function SkeletonCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="bg-card border-border/40 rounded-lg border p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
          <div className="bg-muted h-7 w-16 animate-pulse rounded" />
        </div>
        <div className="bg-muted h-11 w-11 flex-shrink-0 animate-pulse rounded-lg" />
      </div>
    </motion.div>
  );
}

export function StatisticsCards({ stats, isLoading, comparisonData }: StatisticsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <SkeletonCard delay={0} />
        <SkeletonCard delay={0.1} />
        <SkeletonCard delay={0.2} />
        <SkeletonCard delay={0.3} />
      </div>
    );
  }

  // Smart number formatting for payments
  const formatPayment = (amount: number): string => {
    // Remove .00 if no decimals
    const formatted = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
    return `${formatted} RON`;
  };

  const cards = [
    {
      title: "Total Cereri",
      value: stats.cereri.total,
      icon: <FileText className="h-5 w-5" />,
      color: "#3b82f6", // blue-500
      delay: 0,
      comparison: comparisonData?.usageFrequency,
    },
    {
      title: "În Procesare",
      value: stats.cereri.in_progres,
      icon: <Clock className="h-5 w-5" />,
      color: "#f59e0b", // amber-500
      delay: 0.1,
      comparison: comparisonData?.avgCompletionTime,
    },
    {
      title: "Finalizate",
      value: stats.cereri.finalizate,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "#10b981", // emerald-500
      delay: 0.2,
      comparison: comparisonData?.approvalRate,
    },
    {
      title: "Total Plăți",
      value: formatPayment(stats.plati.total_suma),
      icon: <CreditCard className="h-5 w-5" />,
      color: "#8b5cf6", // violet-500
      delay: 0.3,
      // No comparison for total payments (absolute value, not comparable)
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}
