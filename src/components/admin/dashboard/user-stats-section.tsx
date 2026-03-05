"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, UserCheck, Crown, ShieldCheck, MailWarning, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { StatsCard } from "@/components/admin";
import { queryKeys } from "@/lib/react-query";
import { slideIn, defaultTransition } from "@/lib/motion";
import type { UserStatsData, DashboardData } from "@/lib/admin-dashboard-types";

interface UserStatsSectionProps {
  initialData: UserStatsData;
  primarieId: string;
}

function UserStatsSection({ initialData, primarieId }: UserStatsSectionProps) {
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
    select: (d: DashboardData) => d.userStats,
  });

  const stats = data ?? initialData;

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
      className="rounded-2xl border border-white/[0.05] bg-white/[0.024] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-400" />
          <h3 className="text-foreground text-[1.05rem] font-semibold">
            Utilizatori Platforma — pe Rol
          </h3>
        </div>
        <Link
          href="admin/users"
          className="text-accent-500 hover:text-accent-400 flex items-center gap-1 text-xs transition-colors"
        >
          Gestioneaza <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatsCard
          icon={Users}
          label="Cetateni"
          value={stats.cetateni.count}
          trend={stats.cetateni.trend}
          colorVariant="default"
        />
        <StatsCard
          icon={UserCheck}
          label="Functionari"
          value={stats.functionari.count}
          trend={stats.functionari.trend}
          colorVariant="success"
        />
        <StatsCard icon={Crown} label="Primar" value={stats.primar.count} colorVariant="warning" />
        <StatsCard
          icon={ShieldCheck}
          label="Admini"
          value={stats.admini.count}
          colorVariant="accent"
        />
        <StatsCard
          icon={MailWarning}
          label="Pending"
          value={stats.pending.count}
          trend={stats.pending.trend}
          colorVariant="destructive"
        />
      </div>
    </motion.div>
  );
}

export { UserStatsSection };
