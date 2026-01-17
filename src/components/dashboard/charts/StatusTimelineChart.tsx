"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";
import type { StatusTimelineChartProps } from "@/types/dashboard";

/**
 * Status Timeline Chart - Horizontal Progress View
 *
 * Displays active cereri with:
 * - Progress bars showing completion percentage
 * - ETA remaining days
 * - Status indicators
 * - Clickable cards for navigation
 */
export function StatusTimelineChart({
  data,
  isLoading = false,
  onCerereClick,
}: StatusTimelineChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="border-border/40 bg-card flex h-[400px] flex-col items-center justify-center gap-3 rounded-lg border p-8 text-center">
        <AlertCircle className="text-muted-foreground/50 h-12 w-12" />
        <div>
          <p className="text-foreground text-lg font-medium">Nicio cerere activă</p>
          <p className="text-muted-foreground text-sm">
            Cereri noi vor apărea aici când sunt depuse
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border/40 bg-card chart-card space-y-4 rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Progres Cereri Active</h3>
          <p className="text-muted-foreground text-sm">
            {data.length} {data.length === 1 ? "cerere" : "cereri"} în procesare
          </p>
        </div>
        <TrendingUp className="text-primary h-5 w-5" />
      </div>

      <div className="space-y-3">
        {data.map((cerere, index) => (
          <motion.div
            key={cerere.id}
            initial={mounted ? { opacity: 0, x: -20 } : false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => onCerereClick?.(cerere.id)}
            className={`group border-border/40 bg-background hover:border-primary/50 relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${onCerereClick ? "hover:bg-muted/30" : ""} `}
          >
            {/* Header: Cerere info */}
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">{cerere.numar_cerere}</span>
                  <StatusBadge status={cerere.status} />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">{cerere.tip_cerere.nume}</p>
              </div>

              {/* ETA Display */}
              {cerere.progress.eta_days !== null && (
                <div className="bg-muted flex items-center gap-1 rounded-md px-2 py-1 text-xs">
                  <Clock className="text-muted-foreground h-3 w-3" />
                  <span className="text-muted-foreground font-medium">
                    ~{cerere.progress.eta_days} {cerere.progress.eta_days === 1 ? "zi" : "zile"}
                  </span>
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                <motion.div
                  initial={mounted ? { width: 0 } : false}
                  animate={{ width: `${cerere.progress.percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  className={`h-full rounded-full ${getProgressColor(cerere.progress.percentage)}`}
                />
              </div>
              <span className="text-muted-foreground mt-1 text-xs font-medium">
                {cerere.progress.percentage}% completat
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Status badge with Romanian labels
 */
function StatusBadge({ status }: { status: string }) {
  const config = {
    depusa: {
      label: "Depusă",
      color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    in_verificare: {
      label: "În Verificare",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    in_asteptare: {
      label: "În Așteptare",
      color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    in_aprobare: {
      label: "În Aprobare",
      color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
  };

  const statusConfig = config[status as keyof typeof config] || {
    label: status,
    color: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig.color}`}
    >
      {statusConfig.label}
    </span>
  );
}

/**
 * Get progress bar color based on percentage
 */
function getProgressColor(percentage: number): string {
  if (percentage >= 75) return "bg-green-500";
  if (percentage >= 50) return "bg-blue-500";
  if (percentage >= 25) return "bg-yellow-500";
  return "bg-orange-500";
}

/**
 * Loading skeleton
 */
function TimelineSkeleton() {
  return (
    <div className="border-border/40 bg-card space-y-4 rounded-lg border p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="bg-muted h-5 w-48 animate-pulse rounded" />
          <div className="bg-muted h-4 w-32 animate-pulse rounded" />
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-border/40 bg-background rounded-lg border p-4">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="bg-muted h-4 w-32 animate-pulse rounded" />
                <div className="bg-muted h-3 w-48 animate-pulse rounded" />
              </div>
              <div className="bg-muted h-6 w-16 animate-pulse rounded" />
            </div>
            <div className="space-y-1">
              <div className="bg-muted h-2 w-full animate-pulse rounded-full" />
              <div className="bg-muted h-3 w-20 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
