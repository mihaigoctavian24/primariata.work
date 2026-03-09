"use server";

import { logger } from "@/lib/logger";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/admin-dashboard-queries";
import { ShieldCheck } from "lucide-react";

import { WelcomeBanner } from "./welcome-banner";
import { UserStatsSection } from "./user-stats-section";
import { SystemHealthSection } from "./system-health-section";
import { CereriOverviewSection } from "./cereri-overview-section";
import { ActivityChartSection } from "./activity-chart-section";
import { FunctionariPerformance } from "./functionari-performance";
import { AdminAlertsPanel } from "./admin-alerts-panel";
import { LiveFeedSection } from "./live-feed-section";

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
      judete: { nume: string };
    };
  } | null;
}

interface Props {
  primarieId: string;
  judet: string;
  localitate: string;
}

export async function AdminDashboardContent({
  primarieId,
  judet,
  localitate,
}: Props): Promise<React.JSX.Element> {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    // Middleware should prevent this — log and show fallback
    logger.error("AdminDashboardContent: no user after middleware");
    return <div className="p-6 text-red-500">Acces interzis.</div>;
  }

  const { data: userData, error: userError } = await authClient
    .from("utilizatori")
    .select("rol, nume, prenume, email, primarie_id, primarii(localitati(id, nume, judete(nume)))")
    .eq("id", user.id)
    .single();

  if (!userData) {
    logger.error("AdminDashboardContent: no userData", { userError });
    return <div className="p-6 text-red-500">Eroare la încărcarea datelor.</div>;
  }

  const adminName =
    userData.nume && userData.prenume
      ? `${userData.prenume} ${userData.nume}`
      : userData.email || user.email || "Admin";

  const primarieName =
    (userData as UserDataWithRelations).primarii?.localitati?.nume || localitate.replace(/-/g, " ");
  const judetName = (userData as UserDataWithRelations).primarii?.localitati?.judete?.nume || judet;

  const supabase = createServiceRoleClient();
  const dashboardData = await fetchDashboardData(
    supabase,
    primarieId,
    adminName,
    primarieName,
    judetName
  );

  const roleLabel = userData.rol === "super_admin" ? "Super Admin" : "Admin Primărie";

  return (
    <div className="space-y-5">
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
        <div className="flex flex-col gap-5" style={{ gridColumn: "span 8 / span 8" }}>
          <UserStatsSection initialData={dashboardData.userStats} primarieId={primarieId} />
          <SystemHealthSection initialData={dashboardData.healthMetrics} primarieId={primarieId} />
          <CereriOverviewSection
            initialData={dashboardData.cereriOverview}
            primarieId={primarieId}
          />
          <ActivityChartSection initialData={dashboardData.activityData} primarieId={primarieId} />
        </div>
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
