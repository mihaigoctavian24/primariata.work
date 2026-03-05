"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { DonutChart, AnimatedCounter } from "@/components/admin";
import { queryKeys } from "@/lib/react-query";
import { slideIn, fadeIn, defaultTransition } from "@/lib/motion";
import type { CereriOverviewItem, DashboardData } from "@/lib/admin-dashboard-types";

interface CereriOverviewSectionProps {
  initialData: CereriOverviewItem[];
  primarieId: string;
}

function CereriOverviewSection({ initialData, primarieId }: CereriOverviewSectionProps) {
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
    select: (d: DashboardData) => d.cereriOverview,
  });

  const overview = data ?? initialData;
  const totalCount = overview.reduce((sum, item) => sum + item.count, 0);
  const donutData = overview.map((item) => ({
    name: item.label,
    value: item.count,
    color: item.color,
  }));

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
      className="border-border bg-card rounded-2xl border p-5"
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-amber-400" />
          <h3 className="text-foreground text-[1.05rem] font-semibold">
            Supervizare Cereri — Privire de Ansamblu
          </h3>
        </div>
        <Link
          href="admin/cereri"
          className="text-accent-500 hover:text-accent-400 flex items-center gap-1 text-xs transition-colors"
        >
          Supervizeaza <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row">
        <DonutChart data={donutData} size={170} centerValue={totalCount} centerLabel="Total" />

        <div className="grid w-full flex-1 grid-cols-3 gap-2">
          {overview.map((item) => (
            <motion.div
              key={item.status}
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={defaultTransition}
              className="border-border/40 bg-card rounded-xl border p-3 text-center shadow-sm"
            >
              <AnimatedCounter
                target={item.count}
                duration={1200}
                className="text-foreground block text-2xl leading-tight font-bold"
              />
              <span className="text-muted-foreground mt-1 block text-xs">{item.label}</span>
              <div className="mt-1.5 flex items-center justify-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground text-[0.65rem] font-medium">
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export { CereriOverviewSection };
