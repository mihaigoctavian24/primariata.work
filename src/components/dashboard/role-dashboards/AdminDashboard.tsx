"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardData } from "@/actions/dashboard-stats";
import { PendingRegistrationsWidget } from "@/components/admin/PendingRegistrationsWidget";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { CereriStatusOverview } from "@/components/dashboard/CereriStatusOverview";
import { createClient } from "@/lib/supabase/client";
import { Shield, Users, Activity, UserPlus, UserCheck, Mail, Settings } from "lucide-react";
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
 * - Real user counts from user_primarii (Cetateni, Functionari, Admini, Pending)
 * - CereriStatusOverview with clickable badges navigating to /cereri filtered by status
 * - ActivityFeed from cerere_istoric with actor names
 * - PendingRegistrationsWidget (preserved from Phase 3)
 * - Admin settings navigation
 */
export function AdminDashboard({ judet, localitate, profile }: AdminDashboardProps) {
  const router = useRouter();
  const isSuperAdmin = profile.rol === "super_admin";

  // Resolve primarieId for widgets
  const [primarieId, setPrimarieId] = useState<string | null>(null);

  useEffect(() => {
    async function resolvePrimarie(): Promise<void> {
      const supabase = createClient();
      const { data } = await supabase
        .from("primarii")
        .select("id, localitati!inner(slug, judete!inner(slug))")
        .eq("localitati.slug", localitate)
        .eq("localitati.judete.slug", judet)
        .eq("activa", true)
        .single();
      if (data) setPrimarieId(data.id);
    }
    resolvePrimarie();
  }, [judet, localitate]);

  // Fetch admin dashboard data from Server Action
  const { data: adminData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-data"],
    queryFn: async () => {
      const result = await getAdminDashboardData();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const userStatCards = [
    {
      label: "Cetateni",
      value: adminData?.userCounts.cetateni ?? 0,
      icon: Users,
      borderColor: "border-blue-200 dark:border-blue-800",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-600",
      labelColor: "text-blue-600 dark:text-blue-400",
      valueColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "Functionari",
      value: adminData?.userCounts.functionari ?? 0,
      icon: Users,
      borderColor: "border-green-200 dark:border-green-800",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      iconColor: "text-green-600",
      labelColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-700 dark:text-green-300",
    },
    {
      label: "Admini",
      value: adminData?.userCounts.admini ?? 0,
      icon: Shield,
      borderColor: "border-purple-200 dark:border-purple-800",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      iconColor: "text-purple-600",
      labelColor: "text-purple-600 dark:text-purple-400",
      valueColor: "text-purple-700 dark:text-purple-300",
    },
    {
      label: "Pending",
      value: adminData?.userCounts.pending ?? 0,
      icon: Mail,
      borderColor: "border-amber-200 dark:border-amber-800",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-600",
      labelColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-700 dark:text-amber-300",
    },
  ];

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
              {isSuperAdmin && " -- Acces Global Platforma"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: User Management + Cereri Overview + Activity */}
        <div className="space-y-6 lg:col-span-2">
          {/* User Management Overview */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Users className="h-5 w-5 text-blue-500" />
              Management Utilizatori
            </h2>

            {/* User Stats Cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {userStatCards.map((card) => (
                <div
                  key={card.label}
                  className={`rounded-lg border p-4 ${card.borderColor} ${card.bgColor}`}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                    <span className={`text-xs font-medium ${card.labelColor}`}>{card.label}</span>
                  </div>
                  {isLoading ? (
                    <div className="h-8 w-12 animate-pulse rounded bg-current/10" />
                  ) : (
                    <p className={`text-2xl font-bold ${card.valueColor}`}>{card.value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Pending Registrations Widget */}
            {primarieId && (
              <PendingRegistrationsWidget
                judet={judet}
                localitate={localitate}
                primarieId={primarieId}
              />
            )}

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-lg px-4 py-3 transition-colors"
              >
                <Users className="h-4 w-4" />
                Gestionare Utilizatori
              </button>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users`)}
                className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-white transition-colors hover:bg-green-700"
              >
                <UserPlus className="h-4 w-4" />
                Invita Staff
              </button>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/registrations`)}
                className="flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-white transition-colors hover:bg-amber-700"
              >
                <UserCheck className="h-4 w-4" />
                Inregistrari Noi
              </button>
            </div>
          </div>

          {/* Cereri Status Overview (replaces System Health) */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5 text-green-500" />
              Cereri -- Privire de Ansamblu
            </h2>

            {isLoading ? (
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <CereriStatusOverview
                statusCounts={adminData?.cereriOverview ?? {}}
                judet={judet}
                localitate={localitate}
              />
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Activity className="h-5 w-5 text-blue-500" />
              Activitate Recenta
            </h2>

            <ActivityFeed entries={adminData?.recentActivity ?? []} isLoading={isLoading} />
          </div>
        </div>

        {/* COLUMN 2: Admin Quick Actions + Settings + Role Badge */}
        <div className="space-y-6">
          {/* Setari Primarie Button */}
          <button
            onClick={() => router.push(`/app/${judet}/${localitate}/admin/settings`)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/50"
          >
            <Settings className="h-4 w-4" />
            Setari Primarie
          </button>

          {/* Admin Quick Actions */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Settings className="h-5 w-5" />
              Actiuni Admin
            </h3>

            <div className="space-y-2">
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin`)}
                className="border-border hover:bg-accent w-full rounded-lg border px-4 py-2 text-left text-sm transition-colors"
              >
                Dashboard Admin Complet
              </button>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users`)}
                className="border-border hover:bg-accent w-full rounded-lg border px-4 py-2 text-left text-sm transition-colors"
              >
                Invita Staff Nou
              </button>
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin/users`)}
                className="border-border hover:bg-accent w-full rounded-lg border px-4 py-2 text-left text-sm transition-colors"
              >
                Invitatii Pending
              </button>
            </div>
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
                ? "Acces complet la toate primariile platformei"
                : `Administrator pentru Primaria ${localitate.replace(/-/g, " ")}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
