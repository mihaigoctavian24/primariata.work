"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Wallet, TrendingUp, AlertCircle } from "lucide-react";
import type { PlatiOverviewChartProps } from "@/types/dashboard";

/**
 * Plăți Overview Chart - Monthly Bar Chart
 *
 * Displays monthly payment data with:
 * - Bar chart showing total amounts per month
 * - Success vs pending breakdown
 * - Summary statistics
 * - Responsive design
 */
export function PlatiOverviewChart({
  data,
  isLoading = false,
  months = 6,
}: PlatiOverviewChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || !data.monthly || data.monthly.length === 0) {
    return (
      <div className="border-border/40 bg-card flex h-[400px] flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
        <AlertCircle className="text-muted-foreground/50 h-12 w-12" />
        <div>
          <p className="text-foreground text-lg font-medium">Nicio plată înregistrată</p>
          <p className="text-muted-foreground text-sm">Plățile viitoare vor apărea aici</p>
        </div>
      </div>
    );
  }

  const { monthly, summary } = data;

  return (
    <motion.div
      initial={mounted ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="border-border/40 bg-card space-y-4 rounded-lg border p-6 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Evoluție Plăți</h3>
          <p className="text-muted-foreground text-sm">Ultimele {months} luni</p>
        </div>
        <Wallet className="text-primary h-5 w-5" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-0.5">
        <SummaryCard
          label="Total An Curent"
          value={summary.total_year}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <SummaryCard
          label="Luna Curentă"
          value={summary.total_month_current}
          icon={<Wallet className="h-4 w-4" />}
        />
        <SummaryCard
          label="În Așteptare"
          value={summary.upcoming_payments}
          suffix="plăți"
          icon={<AlertCircle className="h-4 w-4" />}
          variant="warning"
        />
      </div>

      {/* Bar Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthly} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="month_label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              stroke="hsl(var(--border))"
              tickFormatter={(value) => `${value} RON`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
            />
            <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(var(--foreground))" }} />
            <Bar
              dataKey="success_suma"
              name="Procesate"
              fill="#10b981"
              stackId="a"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
            <Bar
              dataKey="pending_suma"
              name="În Așteptare"
              fill="#f59e0b"
              stackId="a"
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

/**
 * Summary card component
 */
function SummaryCard({
  label,
  value,
  suffix,
  icon,
  variant = "default",
}: {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  variant?: "default" | "warning";
}) {
  const formatValue = () => {
    if (suffix) return `${value} ${suffix}`;
    // Smart formatting: remove decimals if .00
    const formatted =
      value % 1 === 0
        ? value.toLocaleString("ro-RO")
        : value.toLocaleString("ro-RO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `${formatted} RON`;
  };

  return (
    <div className="border-border/40 bg-background rounded-lg border p-2">
      <div className="flex items-center gap-2">
        <div
          className={`flex-shrink-0 rounded-md p-1.5 ${
            variant === "warning"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground mb-0.5 text-xs whitespace-nowrap">{label}</p>
          <p className="text-foreground text-sm font-semibold whitespace-nowrap">{formatValue()}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Custom tooltip for bar chart
 */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    payload: {
      month_label: string;
      total_plati: number;
      total_suma: number;
      success_count: number;
      success_suma: number;
      pending_count: number;
      pending_suma: number;
    };
  }>;
}) {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="border-border bg-card rounded-lg border p-3 shadow-lg">
      <p className="text-foreground mb-2 text-sm font-semibold">{data.month_label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Total Plăți:</span>
          <span className="text-foreground font-medium">{data.total_plati}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Sumă Totală:</span>
          <span className="text-primary font-medium">
            {data.total_suma.toLocaleString("ro-RO")} RON
          </span>
        </div>
        <div className="border-border mt-2 space-y-1 border-t pt-2">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              ✓ Procesate ({data.success_count})
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {data.success_suma.toLocaleString("ro-RO")} RON
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              ⏳ În așteptare ({data.pending_count})
            </span>
            <span className="font-medium text-yellow-600 dark:text-yellow-400">
              {data.pending_suma.toLocaleString("ro-RO")} RON
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading skeleton
 */
function ChartSkeleton() {
  return (
    <div className="border-border/40 bg-card space-y-4 rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-5 w-32 animate-pulse rounded" />
          <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted h-20 animate-pulse rounded-lg" />
        ))}
      </div>

      <div className="bg-muted h-[300px] w-full animate-pulse rounded-lg" />
    </div>
  );
}
