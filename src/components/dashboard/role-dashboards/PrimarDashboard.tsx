"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatisticsCards } from "@/components/dashboard/StatisticsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ErrorBoundary, InlineError } from "@/components/dashboard";
import { Building2, TrendingUp, Users, FileCheck, AlertCircle } from "lucide-react";
import type { UserProfile } from "@/app/api/user/profile/route";

interface PrimarDashboardProps {
  judet: string;
  localitate: string;
  profile: UserProfile;
}

/**
 * Dashboard pentru utilizatori cu rol 'primar'
 *
 * Features:
 * - Primărie overview (high-level stats)
 * - Approval queue (cereri requiring primar approval)
 * - Financial summary
 * - Staff performance metrics
 * - Citizen satisfaction
 *
 * TODO (M4): Expand with full primar features
 */
export function PrimarDashboard({ judet, localitate, profile }: PrimarDashboardProps) {
  const router = useRouter();
  const { stats, isLoading: statsLoading, error: statsError, refetch } = useDashboardStats();

  return (
    <>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Building2 className="h-10 w-10" />
          <div>
            <h2 className="mb-1 text-2xl font-bold">Primărie {localitate.replace(/-/g, " ")}</h2>
            <p className="text-purple-100">
              Primar: {profile.prenume} {profile.nume}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: Approval Queue + Financial Overview */}
        <div className="space-y-6 lg:col-span-2">
          {/* Approval Queue */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FileCheck className="h-5 w-5 text-amber-500" />
              Cereri care Necesită Aprobare
            </h2>

            <div className="border-t pt-4">
              <p className="text-muted-foreground py-8 text-center text-sm">
                ✅ Coada de aprobare va fi afișată aici
                <br />
                <span className="mt-2 block text-xs">(Feature în dezvoltare - M4)</span>
              </p>
              <button
                onClick={() =>
                  router.push(`/app/${judet}/${localitate}/cereri?status=pending_approval`)
                }
                className="mt-4 w-full rounded-lg bg-amber-500 px-4 py-2 text-white transition-colors hover:bg-amber-600"
              >
                Vezi Cereri Pending Aprobare
              </button>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Situație Financiară
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <p className="mb-1 text-xs font-medium text-green-600 dark:text-green-400">
                  Încasări Totale
                </p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats?.plati.total || 0} RON
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                <p className="mb-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                  Plăți Luna Curentă
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">0 RON</p>
              </div>
            </div>

            <button
              onClick={() => router.push(`/app/${judet}/${localitate}/plati`)}
              className="border-border hover:bg-accent mt-4 w-full rounded-lg border px-4 py-2 text-sm transition-colors"
            >
              Vezi Raport Detaliat
            </button>
          </div>

          {/* Staff Performance */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-blue-500" />
              Performanță Staff
            </h2>

            <div className="border-t pt-4">
              <p className="text-muted-foreground py-8 text-center text-sm">
                👥 Metrici de performanță staff vor fi afișate aici
                <br />
                <span className="mt-2 block text-xs">(Feature în dezvoltare - M4)</span>
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Statistics + Alerts + Quick Actions */}
        <div className="space-y-6">
          {/* Statistics Cards */}
          <ErrorBoundary>
            {statsError ? (
              <InlineError error={statsError as Error} onRetry={refetch} />
            ) : (
              <StatisticsCards stats={stats} isLoading={statsLoading} />
            )}
          </ErrorBoundary>

          {/* Alerts / Priority Items */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Alerte Prioritare
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {stats ? stats.cereri.total - stats.cereri.in_progres - stats.cereri.finalizate : 0}{" "}
                cereri noi necesită atenție
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {stats?.cereri.in_progres || 0} cereri în procesare
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Acțiuni Rapide</h3>
            <QuickActions judet={judet} localitate={localitate} />

            <div className="mt-4 border-t pt-4">
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2 transition-colors"
              >
                Administrare Primărie
              </button>
            </div>
          </div>

          {/* Citizen Satisfaction */}
          <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20">
            <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-blue-100">
              Satisfacție Cetățeni
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300">4.5</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">/ 5.0</p>
            </div>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Bazat pe {stats?.cereri.finalizate || 0} cereri finalizate
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
