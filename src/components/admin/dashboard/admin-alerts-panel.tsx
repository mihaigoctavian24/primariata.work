"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { queryKeys } from "@/lib/react-query";
import { slideIn, defaultTransition } from "@/lib/motion";
import type { AdminAlert, DashboardData } from "@/lib/admin-dashboard-types";

interface AdminAlertsPanelProps {
  initialData: AdminAlert[];
  primarieId: string;
  judet: string;
  localitate: string;
}

const severityColorMap: Record<AdminAlert["severity"], string> = {
  urgent: "#ef4444",
  warning: "#f59e0b",
  info: "#3b82f6",
  system: "#8b5cf6",
};

function AdminAlertsPanel({ initialData, primarieId }: AdminAlertsPanelProps) {
  const { data } = useQuery({
    queryKey: queryKeys.adminDashboard.data(primarieId),
    queryFn: async (): Promise<DashboardData> => {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
    initialData: undefined,
    refetchInterval: 60_000,
    staleTime: 30_000,
    select: (d: DashboardData) => d.alerts,
  });

  const alerts = data ?? initialData;

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
      className="border-border bg-card rounded-2xl border p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <h3 className="text-foreground text-sm font-semibold">Atentie Admin</h3>
      </div>

      {alerts.length === 0 ? (
        <div className="text-muted-foreground flex items-center gap-2 py-4 text-sm">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          Nicio alerta
        </div>
      ) : (
        alerts.map((alert) => {
          const color = severityColorMap[alert.severity];
          return (
            <div
              key={alert.id}
              className="border-border/30 flex items-center gap-3 border-b py-2.5 last:border-0"
            >
              <div className="h-8 w-1 rounded-full" style={{ background: color }} />
              <div className="min-w-0 flex-1">
                <div className="text-foreground text-sm">{alert.title}</div>
                <div className="text-muted-foreground text-[0.68rem]">{alert.description}</div>
              </div>
              <Link
                href={alert.actionHref}
                className="rounded-lg px-2 py-1 text-[0.65rem] font-semibold transition-all hover:brightness-110"
                style={{
                  background: `${color}25`,
                  color,
                }}
              >
                {alert.actionLabel}
              </Link>
            </div>
          );
        })
      )}
    </motion.div>
  );
}

export { AdminAlertsPanel };
