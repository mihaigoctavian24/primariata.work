"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ApprovalQueue } from "@/components/dashboard/ApprovalQueue";
import { RevenueOverview } from "@/components/dashboard/RevenueOverview";
import { StaffMetricsTable } from "@/components/dashboard/StaffMetricsTable";
import { getPrimarDashboardData } from "@/actions/dashboard-stats";
import { Building2, TrendingUp, Users, FileCheck, CheckCircle, AlertCircle } from "lucide-react";
import type { UserProfile } from "@/app/api/user/profile/route";

interface PrimarDashboardProps {
  judet: string;
  localitate: string;
  profile: UserProfile;
}

/**
 * Dashboard for primar role.
 *
 * Features:
 * - Approval queue with inline approve/reject actions
 * - Financial overview with RON totals and revenue by cerere type
 * - Staff performance metrics table
 * - Quick actions and approval alert
 */
export function PrimarDashboard({ judet, localitate, profile }: PrimarDashboardProps) {
  const router = useRouter();

  const {
    data: primarData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["primar-dashboard-data"],
    queryFn: async () => {
      const result = await getPrimarDashboardData();
      if (!result.success) throw new Error(result.error);
      return result.data!;
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const approvalCount = primarData?.approvalQueue?.length ?? 0;

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
            <h2 className="mb-1 text-2xl font-bold">Primarie {localitate.replace(/-/g, " ")}</h2>
            <p className="text-purple-100">
              Primar: {profile.prenume} {profile.nume}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* COLUMN 1: Approval Queue + Financial Overview + Staff Metrics */}
        <div className="space-y-6 lg:col-span-2">
          {/* Approval Queue */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <FileCheck className="h-5 w-5 text-amber-500" />
              Cereri care Necesita Aprobare
            </h2>
            <div className="border-t pt-4">
              <ApprovalQueue
                items={primarData?.approvalQueue ?? []}
                isLoading={isLoading}
                judet={judet}
                localitate={localitate}
                onActionComplete={() => refetch()}
              />
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Situatie Financiara
            </h2>
            <RevenueOverview
              totalRevenue={primarData?.financialOverview?.totalRevenue ?? 0}
              revenueThisMonth={primarData?.financialOverview?.revenueThisMonth ?? 0}
              revenueByType={primarData?.financialOverview?.revenueByType ?? []}
              isLoading={isLoading}
            />
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
              Performanta Staff
            </h2>
            <StaffMetricsTable
              metrics={primarData?.staffMetrics ?? []}
              staffCount={primarData?.staffCount ?? 0}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* COLUMN 2: Approval Alert + Quick Actions */}
        <div className="space-y-6">
          {/* Approval count alert */}
          {approvalCount > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Atentie
                </h3>
              </div>
              <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                {approvalCount} {approvalCount === 1 ? "cerere necesita" : "cereri necesita"}{" "}
                aprobarea dvs.
              </p>
            </div>
          ) : !isLoading ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/20">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">La zi</h3>
              </div>
              <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                Nicio cerere in asteptare pentru aprobare
              </p>
            </div>
          ) : null}

          {/* Quick Actions */}
          <div className="bg-card border-border/40 rounded-lg border p-6">
            <h3 className="mb-4 text-lg font-semibold">Actiuni Rapide</h3>
            <QuickActions judet={judet} localitate={localitate} />

            <div className="mt-4 border-t pt-4">
              <button
                onClick={() => router.push(`/app/${judet}/${localitate}/admin`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg px-4 py-2 transition-colors"
              >
                Administrare Primarie
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
