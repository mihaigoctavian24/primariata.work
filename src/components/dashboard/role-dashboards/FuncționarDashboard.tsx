"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatisticsCards } from "@/components/dashboard/StatisticsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ErrorBoundary, InlineError } from "@/components/dashboard";
import { FileText, Users, Clock, CheckCircle } from "lucide-react";
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
 * - Assigned cereri queue (cereri assigned to this funcționar)
 * - Departament statistics
 * - Processing tools
 * - Citizen requests overview
 * - Quick actions for funcționar tasks
 *
 * TODO (M4): Expand with full funcționar features
 */
export function FuncționarDashboard({ judet, localitate, profile }: FuncționarDashboardProps) {
  const router = useRouter();
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
    refetch,
  } = useDashboardStats({ judet, localitate });

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
          Rol: Funcționar {profile.departament && `• Departament: ${profile.departament}`}
        </p>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: Assigned Work Queue */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FileText className="text-primary h-5 w-5" />
              Cereri Asignate
            </h2>

            {/* Quick Stats for Funcționar */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Pending
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                  {stats
                    ? stats.cereri.total - stats.cereri.in_progres - stats.cereri.finalizate
                    : 0}
                </p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    În Procesare
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats?.cereri.in_progres || 0}
                </p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Finalizate
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats?.cereri.finalizate || 0}
                </p>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    Total
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats?.cereri.total || 0}
                </p>
              </div>
            </div>

            {/* Placeholder for assigned cereri list */}
            <div className="border-t pt-4">
              <p className="text-muted-foreground py-8 text-center text-sm">
                📋 Lista de cereri asignate va fi afișată aici
                <br />
                <span className="mt-2 block text-xs">(Feature în dezvoltare - M4)</span>
              </p>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/cereri`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 w-full rounded-lg px-4 py-2 transition-colors"
              >
                Vezi Toate Cererile
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Statistics + Quick Actions */}
        <div className="space-y-6">
          {/* Statistics Cards */}
          <ErrorBoundary>
            {statsError ? (
              <InlineError error={statsError as Error} onRetry={refetch} />
            ) : (
              <StatisticsCards stats={stats} isLoading={statsLoading} />
            )}
          </ErrorBoundary>

          {/* Quick Actions for Funcționar */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Acțiuni Rapide</h3>
            <QuickActions judet={judet} localitate={localitate} />
          </div>

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
