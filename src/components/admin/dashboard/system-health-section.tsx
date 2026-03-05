"use client";

import { useQuery } from "@tanstack/react-query";
import { Server, Cpu, HardDrive, Wifi, Activity } from "lucide-react";
import { motion } from "motion/react";
import { queryKeys } from "@/lib/react-query";
import { slideIn, stagger, defaultTransition } from "@/lib/motion";
import type { HealthMetricsData, DashboardData } from "@/lib/admin-dashboard-types";

interface SystemHealthSectionProps {
  initialData: HealthMetricsData;
  primarieId: string;
}

const healthMetricCards = [
  {
    key: "dbLoad" as const,
    icon: Cpu,
    label: "DB Load",
    color: "#10b981",
    getValue: (d: HealthMetricsData) => `${d.dbLoad.value}%`,
    getStatus: (d: HealthMetricsData) =>
      d.dbLoad.value < 50 ? "OK" : d.dbLoad.value < 80 ? "Moderat" : "Ridicat",
  },
  {
    key: "storage" as const,
    icon: HardDrive,
    label: "Storage",
    color: "#3b82f6",
    getValue: (d: HealthMetricsData) => d.storage.label,
    getStatus: () => "OK",
  },
  {
    key: "apiResponse" as const,
    icon: Wifi,
    label: "API Response",
    color: "#8b5cf6",
    getValue: (d: HealthMetricsData) => `${d.apiResponse.avgMs}ms`,
    getStatus: (d: HealthMetricsData) =>
      d.apiResponse.avgMs < 200 ? "OK" : d.apiResponse.avgMs < 500 ? "Lent" : "Critic",
  },
  {
    key: "activeSessions" as const,
    icon: Activity,
    label: "Sesiuni Active",
    color: "#f59e0b",
    getValue: (d: HealthMetricsData) => `${d.activeSessions.count}`,
    getStatus: () => "Normal",
  },
];

function SystemHealthSection({ initialData, primarieId }: SystemHealthSectionProps) {
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
    select: (d: DashboardData) => d.healthMetrics,
  });

  const metrics = data ?? initialData;

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
      className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <Server className="h-5 w-5 text-sky-400" />
        <h3 className="text-foreground text-[1.05rem] font-semibold">Sanatate Platforma</h3>
      </div>

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-4 gap-3"
      >
        {healthMetricCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.key}
              variants={slideIn}
              transition={defaultTransition}
              className="flex items-center gap-3 rounded-xl px-3 py-3"
              style={{
                background: `${card.color}06`,
                border: `1px solid ${card.color}10`,
              }}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${card.color}12` }}
              >
                <Icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
              <div>
                <div className="text-foreground text-sm font-semibold">
                  {card.getValue(metrics)}
                </div>
                <div className="text-muted-foreground text-[0.7rem]">
                  {card.label} · {card.getStatus(metrics)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export { SystemHealthSection };
