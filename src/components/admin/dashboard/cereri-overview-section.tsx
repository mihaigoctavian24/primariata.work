"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { DonutChart, AnimatedCounter } from "@/components/admin";
import { queryKeys } from "@/lib/react-query";
import { slideIn, defaultTransition } from "@/lib/motion";
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
      className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5"
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
          {overview.map((item, i) => (
            <motion.div
              key={item.status}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.35 + i * 0.04 }}
              style={{
                background: `${item.color}10`,
                border: `1px solid ${item.color}25`,
              }}
              className="group relative cursor-pointer overflow-hidden rounded-xl p-4 text-center"
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 80%, ${item.color}20, transparent 70%)`,
                }}
              />
              <div className="relative z-10">
                <AnimatedCounter
                  target={item.count}
                  duration={1200}
                  className="block text-[1.75rem] leading-[1.2] font-bold"
                  style={{ color: item.color }}
                />
                <span className="text-muted-foreground mt-1 block text-[0.75rem]">
                  {item.label}
                </span>
                <div className="mt-1.5 flex items-center justify-center gap-1.5">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground text-[0.65rem] font-medium">
                    {item.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export { CereriOverviewSection };
