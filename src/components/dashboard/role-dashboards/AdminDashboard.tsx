"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { StatisticsCards } from "@/components/dashboard/StatisticsCards";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ErrorBoundary, InlineError } from "@/components/dashboard";
import { Shield, Users, Settings, Activity, UserPlus, Mail } from "lucide-react";
import type { UserProfile } from "@/app/api/user/profile/route";

interface AdminDashboardProps {
  judet: string;
  localitate: string;
  profile: UserProfile;
}

/**
 * Dashboard pentru utilizatori cu rol 'admin' sau 'super_admin'
 *
 * Features:
 * - User management overview
 * - System health monitoring
 * - Role assignments
 * - Invitation status tracking
 * - Activity logs
 * - Quick access to admin panels
 *
 * TODO (M4): Expand with full admin features
 */
export function AdminDashboard({ judet, localitate, profile }: AdminDashboardProps) {
  const router = useRouter();
  const { stats, isLoading: statsLoading, error: statsError, refetch } = useDashboardStats();

  const isSuperAdmin = profile.rol === "super_admin";

  return (
    <>
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-3">
          <Shield className="h-10 w-10" />
          <div>
            <h2 className="mb-1 text-2xl font-bold">
              {isSuperAdmin ? "Super Administrator" : "Administrator"}
            </h2>
            <p className="text-red-100">
              {profile.prenume} {profile.nume}
              {isSuperAdmin && " • Acces Global Platformă"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: User Management + System Health */}
        <div className="space-y-6 lg:col-span-2">
          {/* User Management Overview */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-blue-500" />
              Management Utilizatori
            </h2>

            {/* User Stats */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    Cetățeni
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">0</p>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Funcționari
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">0</p>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                    Admini
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">0</p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                <div className="mb-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Invitații
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">0</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition-colors"
              >
                <Users className="h-4 w-4" />
                Gestionare Utilizatori
              </button>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users/invite`)}
                className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4" />
                Invită Staff
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5 text-green-500" />
              Sănătate Sistem
            </h2>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Database</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">Operational</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Authentication</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">Operational</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">Operational</span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Email Service</span>
                </div>
                <span className="text-xs text-green-600 dark:text-green-400">Operational</span>
              </div>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5 text-blue-500" />
              Activitate Recentă
            </h2>

            <div className="border-t pt-4">
              <p className="text-muted-foreground py-8 text-center text-sm">
                📊 Jurnal de activitate va fi afișat aici
                <br />
                <span className="mt-2 block text-xs">(Feature în dezvoltare - M4)</span>
              </p>
            </div>
          </div>
        </div>

        {/* COLUMN 2: Statistics + Quick Actions + Settings */}
        <div className="space-y-6">
          {/* Statistics Cards */}
          <ErrorBoundary>
            {statsError ? (
              <InlineError error={statsError as Error} onRetry={refetch} />
            ) : (
              <StatisticsCards stats={stats} isLoading={statsLoading} />
            )}
          </ErrorBoundary>

          {/* Admin Quick Actions */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Settings className="h-5 w-5" />
              Acțiuni Admin
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin`)}
                className="border-border hover:bg-accent w-full rounded-lg border px-4 py-2 text-left text-sm transition-colors"
              >
                📊 Dashboard Admin Complet
              </button>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users/invite`)}
                className="border-border hover:bg-accent w-full rounded-lg border px-4 py-2 text-left text-sm transition-colors"
              >
                ✉️ Invită Staff Nou
              </button>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users/invitations`)}
                className="border-border hover:bg-accent w-full rounded-lg border px-4 py-2 text-left text-sm transition-colors"
              >
                📋 Invitații Pending
              </button>
            </div>
          </div>

          {/* Standard Quick Actions */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Acțiuni Generale</h3>
            <QuickActions judet={judet} localitate={localitate} />
          </div>

          {/* Role Badge */}
          <div className="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-6 dark:border-red-800 dark:from-red-950/20 dark:to-pink-950/20">
            <div className="mb-2 flex items-center gap-3">
              <Shield className="h-6 w-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </h3>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">
              {isSuperAdmin
                ? "Acces complet la toate primăriile platformei"
                : `Administrator pentru Primăria ${localitate.replace(/-/g, " ")}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
