"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { motion } from "motion/react";
import { ActivityChart } from "@/components/admin";
import { queryKeys } from "@/lib/react-query";
import { slideIn, defaultTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ActivityDataPoint, DashboardData } from "@/lib/admin-dashboard-types";

interface ActivityChartSectionProps {
  initialData: ActivityDataPoint[];
  primarieId: string;
}

function ActivityChartSection({ initialData, primarieId }: ActivityChartSectionProps) {
  const [range, setRange] = useState<"7d" | "30d">("30d");

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
    select: (d: DashboardData) => d.activityData,
  });

  const activityData = data ?? initialData;
  const filteredData = range === "7d" ? activityData.slice(-7) : activityData;

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
          <CalendarDays className="text-accent-500 h-5 w-5" />
          <h3 className="text-foreground text-[0.95rem] font-semibold">Activitate Cereri</h3>
        </div>
        <div
          className="flex items-center gap-1 rounded-lg p-0.5"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          {(["7d", "30d"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1 text-[0.75rem] font-medium transition-all",
                range === r ? "text-white" : "text-gray-500 hover:text-gray-300"
              )}
              style={range === r ? { background: "rgba(236,72,153,0.2)" } : undefined}
            >
              {r === "7d" ? "7 zile" : "30 zile"}
            </button>
          ))}
        </div>
      </div>

      {filteredData.length > 0 ? (
        <ActivityChart
          data={filteredData as { date: string; value: number; [key: string]: string | number }[]}
          height={144}
        />
      ) : (
        <div className="text-muted-foreground flex h-[144px] items-center justify-center text-sm">
          Nicio activitate in aceasta perioada
        </div>
      )}
    </motion.div>
  );
}

export { ActivityChartSection };
