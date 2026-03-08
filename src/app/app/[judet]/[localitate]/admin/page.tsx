import { logger } from "@/lib/logger";
import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/admin-dashboard-queries";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { WelcomeBanner } from "@/components/admin/dashboard/welcome-banner";
import { UserStatsSection } from "@/components/admin/dashboard/user-stats-section";
import { SystemHealthSection } from "@/components/admin/dashboard/system-health-section";
import { CereriOverviewSection } from "@/components/admin/dashboard/cereri-overview-section";
import { ActivityChartSection } from "@/components/admin/dashboard/activity-chart-section";
import { FunctionariPerformance } from "@/components/admin/dashboard/functionari-performance";
import { AdminAlertsPanel } from "@/components/admin/dashboard/admin-alerts-panel";
import { LiveFeedSection } from "@/components/admin/dashboard/live-feed-section";

// Type definition for userData with nested relations
interface UserDataWithRelations {
  rol: string;
  nume: string;
  prenume: string;
  email: string;
  primarie_id: string;
  primarii: {
    localitati: {
      nume: string;
      id: string;
      judete: {
        nume: string;
      };
    };
  } | null;
}

/**
 * Admin Dashboard - Data-rich overview
 *
 * Protected route - requires authentication and admin/super_admin role
 * Shows: user stats, cereri overview, system health, functionari performance,
 * alerts, activity chart, and live event feed.
 */
export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ judet: string; localitate: string }>;
}) {
  const { judet, localitate } = await params;

  // === AUTH CHECK ===
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData, error: userError } = await authClient
    .from("utilizatori")
    .select("rol, nume, prenume, email, primarie_id, primarii(localitati(id, nume, judete(nume)))")
    .eq("id", user.id)
    .single();

  logger.debug("Admin Dashboard Auth:", {
    userId: user.id,
    userRole: userData?.rol,
    hasUserData: !!userData,
    userError,
  });

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    logger.error("Access denied - not admin", { userData, userError });
    redirect("/auth/login");
  }

  const primarieId = userData.primarie_id;
  if (!primarieId) {
    logger.error("Admin user has no primarie_id");
    redirect("/auth/login");
  }

  // === DERIVE DISPLAY VALUES ===
  const adminName =
    userData.nume && userData.prenume
      ? `${userData.prenume} ${userData.nume}`
      : userData.email || user.email || "Admin";

  const primarieName =
    (userData as UserDataWithRelations).primarii?.localitati?.nume || localitate.replace(/-/g, " ");
  const judetName = (userData as UserDataWithRelations).primarii?.localitati?.judete?.nume || judet;

  // === DATA FETCH ===
  const supabase = createServiceRoleClient();
  const dashboardData = await fetchDashboardData(
    supabase,
    primarieId,
    adminName,
    primarieName,
    judetName
  );

  const roleLabel = userData.rol === "super_admin" ? "Super Admin" : "Admin Primărie";

  // === RENDER ===
  return (
    <div className="space-y-5">
      {/* Page header — title + role badge + system status */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-white" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
              Panou Administrare
            </h1>
            <div
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
              style={{
                background: "linear-gradient(135deg, rgba(236,72,153,0.1), rgba(139,92,246,0.08))",
                border: "1px solid rgba(236,72,153,0.12)",
              }}
            >
              <ShieldCheck className="h-3 w-3 text-pink-400" />
              <span className="text-pink-400" style={{ fontSize: "0.68rem", fontWeight: 600 }}>
                {roleLabel}
              </span>
            </div>
          </div>
          <p
            className="mt-1 text-gray-600"
            style={{ fontSize: "0.83rem" }}
            suppressHydrationWarning
          >
            {primarieName}, {judetName} ·{" "}
            {new Date().toLocaleDateString("ro-RO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.12)" }}
        >
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-emerald-400" style={{ fontSize: "0.72rem" }}>
            Toate sistemele operaționale
          </span>
        </div>
      </div>

      <WelcomeBanner {...dashboardData.welcome} />

      <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(12, 1fr)" }}>
        {/* Left column: 8 cols on xl, full width on mobile */}
        <div className="flex flex-col gap-5" style={{ gridColumn: "span 8 / span 8" }}>
          <UserStatsSection initialData={dashboardData.userStats} primarieId={primarieId} />
          <SystemHealthSection initialData={dashboardData.healthMetrics} primarieId={primarieId} />
          <CereriOverviewSection
            initialData={dashboardData.cereriOverview}
            primarieId={primarieId}
          />
          <ActivityChartSection initialData={dashboardData.activityData} primarieId={primarieId} />
        </div>

        {/* Right column: 4 cols on xl, full width on mobile */}
        <div className="flex flex-col gap-5" style={{ gridColumn: "span 4 / span 4" }}>
          <FunctionariPerformance
            initialData={dashboardData.performance}
            primarieId={primarieId}
            judet={judet}
            localitate={localitate}
          />
          <AdminAlertsPanel
            initialData={dashboardData.alerts}
            primarieId={primarieId}
            judet={judet}
            localitate={localitate}
          />
          <LiveFeedSection primarieId={primarieId} />
        </div>
      </div>
    </div>
  );
}
