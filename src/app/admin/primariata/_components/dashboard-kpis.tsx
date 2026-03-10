"use client";

import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

export interface DashboardKPI {
  label: string;
  value: number | string;
  total?: number;
  prefix?: string;
  suffix?: string;
  trend?: string;
  trendUp?: boolean;
  subtitle?: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

interface DashboardKPIsProps {
  kpis: DashboardKPI[];
}

export function DashboardKPIs({ kpis }: DashboardKPIsProps) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-muted group cursor-default rounded-2xl p-4 transition-transform hover:scale-[1.02]"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: kpi.bg, border: `1px solid ${kpi.color}20` }}
              >
                <Icon className="h-4 w-4" style={{ color: kpi.color }} />
              </div>
              {kpi.trend && (
                <div
                  className="flex items-center gap-0.5"
                  style={{ color: kpi.trendUp ? "#10b981" : "#ef4444" }}
                >
                  {kpi.trendUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-[0.68rem] font-semibold">{kpi.trend}</span>
                </div>
              )}
            </div>
            <div className="text-foreground text-[1.35rem] leading-none font-bold">
              {kpi.prefix}
              {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
              {kpi.suffix || ""}
            </div>
            <div className="text-muted-foreground mt-1 text-[0.72rem]">{kpi.label}</div>
            {kpi.subtitle && (
              <div className="text-muted-foreground mt-0.5 text-[0.65rem]">{kpi.subtitle}</div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
