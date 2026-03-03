"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getFunctionarStats } from "@/actions/dashboard-stats";
import { useCereriList } from "@/hooks/use-cereri-list";
import { CereriTable } from "@/components/cereri/CereriTable";
import { calculateSla } from "@/lib/cereri/sla";
import type { SlaStatus } from "@/lib/cereri/sla";
import { FileText, Clock, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import type { UserProfile } from "@/app/api/user/profile/route";

interface FuncționarDashboardProps {
  judet: string;
  localitate: string;
  profile: UserProfile;
}

/**
 * Dashboard pentru utilizatori cu rol 'functionar'
 *
 * Features:
 * - 4 real stat cards from Server Action (Pending, Overdue, In Progress, Completed Today)
 * - SLA-sorted cereri queue using CereriTable
 * - Click row to navigate to cerere detail (DASH-02/03/04 handled there)
 */
export function FuncționarDashboard({ judet, localitate, profile }: FuncționarDashboardProps) {
  const [page, setPage] = useState(1);

  // Fetch functionar stats from Server Action
  const { data: funcStats, isLoading: statsLoading } = useQuery({
    queryKey: ["functionar-stats"],
    queryFn: async () => {
      const result = await getFunctionarStats();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Fetch cereri list (all non-draft cereri -- API already excludes drafts)
  const { cereri, pagination, isLoading: cereriLoading } = useCereriList({ page, limit: 20 });

  // Sort cereri by SLA urgency (red first, then yellow, green, paused, none)
  const slaOrder: Record<SlaStatus, number> = { red: 0, yellow: 1, green: 2, paused: 3, none: 4 };
  const sortedCereri = useMemo(() => {
    if (!cereri?.length) return [];
    return [...cereri].sort((a, b) => {
      const slaA = calculateSla(a.data_termen, a.status, undefined);
      const slaB = calculateSla(b.data_termen, b.status, undefined);
      return (slaOrder[slaA.status] ?? 5) - (slaOrder[slaB.status] ?? 5);
    });
  }, [cereri]);

  // No-op handlers for CereriTable actions (functionar clicks row to navigate)
  const handleNoOp = (): void => {
    // Actions handled on cerere detail page
  };

  const statCards = [
    {
      label: "Pending",
      value: funcStats?.pending ?? 0,
      icon: Clock,
      borderColor: "border-amber-200 dark:border-amber-800",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600",
      labelColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-300",
    },
    {
      label: "Depasit Termen",
      value: funcStats?.overdue ?? 0,
      icon: AlertTriangle,
      borderColor: "border-red-200 dark:border-red-800",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      iconColor: "text-red-600",
      labelColor: "text-red-600 dark:text-red-400",
      valueColor: "text-red-700 dark:text-red-300",
    },
    {
      label: "In Procesare",
      value: funcStats?.inProgress ?? 0,
      icon: FileText,
      borderColor: "border-blue-200 dark:border-blue-800",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600",
      labelColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Finalizate Azi",
      value: funcStats?.completedToday ?? 0,
      icon: CheckCircle,
      borderColor: "border-green-200 dark:border-green-800",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600",
      labelColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-700 dark:text-green-300",
    },
  ];

  return (
    <>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white shadow-lg"
      >
        <h2 className="mb-2 text-2xl font-bold">
          Bun venit, {profile.prenume} {profile.nume}
        </h2>
        <p className="text-blue-100">
          Rol: Functionar {profile.departament && `-- Departament: ${profile.departament}`}
        </p>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: Stat Cards + Cereri Queue */}
        <div className="space-y-6 lg:col-span-2">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className={`rounded-lg border p-4 ${card.borderColor} ${card.bgColor}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                  <span className={`text-xs font-medium ${card.labelColor}`}>{card.label}</span>
                </div>
                {statsLoading ? (
                  <div className="h-8 w-12 animate-pulse rounded bg-current/10" />
                ) : (
                  <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Cereri Queue */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FileText className="text-primary h-5 w-5" />
              Cereri -- Ordonate dupa SLA
            </h2>

            <CereriTable
              cereri={sortedCereri}
              onCancel={handleNoOp}
              onDownload={handleNoOp}
              isLoading={cereriLoading}
            />

            {pagination && pagination.total_pages > 1 && (
              <div className="mt-4 flex items-center justify-between border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  Pagina {pagination.page} din {pagination.total_pages} ({pagination.total} cereri)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="border-border hover:bg-accent rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Anterioara
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
                    disabled={page >= pagination.total_pages}
                    className="border-border hover:bg-accent rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Urmatoarea
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLUMN 2: Link + Departament Info */}
        <div className="space-y-6">
          {/* View All Cereri Link */}
          <Link
            href={`/app/${judet}/${localitate}/cereri`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Vezi Toate Cererile
          </Link>

          {/* Departament Info */}
          {profile.departament && (
            <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
              <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
                Departament
              </h3>
              <p className="font-medium text-blue-700 dark:text-blue-300">{profile.departament}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
