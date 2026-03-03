"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, TrendingUp } from "lucide-react";

interface RevenueOverviewProps {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueByType: Array<{ tipCerere: string; total: number }>;
  isLoading: boolean;
}

function formatRON(value: number): string {
  return new Intl.NumberFormat("ro-RO", { minimumFractionDigits: 2 }).format(value);
}

export function RevenueOverview({
  totalRevenue,
  revenueThisMonth,
  revenueByType,
  isLoading,
}: RevenueOverviewProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="rounded-lg border p-4">
            <Skeleton className="mb-2 h-4 w-28" />
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
          <div className="mb-1 flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <p className="text-xs font-medium text-green-600 dark:text-green-400">
              Incasari Totale
            </p>
          </div>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">
            {formatRON(totalRevenue)} RON
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400">
              Plati Luna Curenta
            </p>
          </div>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
            {formatRON(revenueThisMonth)} RON
          </p>
        </div>
      </div>

      {/* Revenue by Type */}
      <div>
        <h4 className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          Top Incasari pe Tip Cerere
        </h4>
        {revenueByType.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">Nicio plata inregistrata</p>
        ) : (
          <ul className="space-y-2">
            {revenueByType.map((item) => (
              <li
                key={item.tipCerere}
                className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm"
              >
                <span className="truncate pr-4">{item.tipCerere}</span>
                <span className="shrink-0 font-medium">{formatRON(item.total)} RON</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
