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
      className="border-border bg-card rounded-2xl border p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog className="h-4 w-4 text-violet-400" />
          <h3 className="text-foreground text-sm font-semibold">Performanta Functionari</h3>
        </div>
        <Link
          href="admin/users"
          className="text-muted-foreground hover:text-foreground text-xs transition-colors"
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
            transition={{ delay: 0.05 * i, ...defaultTransition }}
            className="border-border/30 flex items-center gap-3 border-b py-2.5 last:border-0"
          >
            {/* Avatar with online indicator */}
            <div className="relative">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
                  fontSize: "0.65rem",
                  fontWeight: 600,
                }}
              >
                {f.initials}
              </div>
              <div
                className={`border-card absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 ${
                  f.isOnline ? "bg-emerald-400" : "bg-gray-600"
                }`}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-foreground truncate text-sm">{f.name}</div>
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
