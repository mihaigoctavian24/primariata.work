"use client";

import { useQuery } from "@tanstack/react-query";
import { UserCog } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { queryKeys } from "@/lib/react-query";
import { slideIn, defaultTransition } from "@/lib/motion";
import type {
  FunctionarPerformance as FunctionarPerformanceData,
  DashboardData,
} from "@/lib/admin-dashboard-types";

interface FunctionariPerformanceProps {
  initialData: FunctionarPerformanceData[];
  primarieId: string;
  judet: string;
  localitate: string;
}

function FunctionariPerformance({ initialData, primarieId }: FunctionariPerformanceProps) {
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
    select: (d: DashboardData) => d.performance,
  });

  const performance = data ?? initialData;

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
      className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog className="text-accent-500 h-4 w-4" />
          <h3 className="text-foreground text-[0.9rem] font-semibold">Performanta Functionari</h3>
        </div>
        <Link
          href="admin/users"
          className="hover:text-foreground text-[11.5px] text-[#6a7282] transition-colors"
        >
          Toti →
        </Link>
      </div>

      {performance.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-xs">
          Niciun functionar inregistrat
        </p>
      ) : (
        performance.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 + i * 0.05, ...defaultTransition }}
            className="flex items-center gap-3 border-b border-white/[0.03] py-2.5 last:border-0"
          >
            {/* Avatar with online indicator */}
            <div className="relative">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{
                  background: "var(--accent-gradient)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              >
                {f.initials}
              </div>
              <div
                className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c0c18] ${
                  f.isOnline ? "bg-emerald-400" : "bg-gray-600"
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-[0.82rem]">{f.name}</div>
              <div className="text-muted-foreground text-[0.68rem]">
                {f.cereriResolved} cereri rez.
              </div>
            </div>

            <div className="text-right">
              <div
                className="text-sm font-semibold"
                style={{
                  color:
                    f.resolutionRate >= 90
                      ? "#10b981"
                      : f.resolutionRate >= 80
                        ? "#f59e0b"
                        : "#ef4444",
                }}
              >
                {f.resolutionRate}%
              </div>
              <div className="text-muted-foreground text-[0.6rem]">rata</div>
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
}

export { FunctionariPerformance };
