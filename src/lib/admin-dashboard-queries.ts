import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type {
  DashboardData,
  UserStatsData,
  CereriOverviewItem,
  HealthMetricsData,
  FunctionarPerformance,
  AdminAlert,
  ActivityDataPoint,
  WelcomeBannerData,
} from "./admin-dashboard-types";

type DbClient = SupabaseClient<Database>;

const CERERI_STATUS_MAP: { status: string; label: string; color: string }[] = [
  { status: "depusa", label: "Depuse", color: "#3b82f6" },
  { status: "in_verificare", label: "In Verificare", color: "#8b5cf6" },
  { status: "info_suplimentara", label: "Info Suplimentara", color: "#f59e0b" },
  { status: "aprobata", label: "Aprobate", color: "#10b981" },
  { status: "in_procesare", label: "In Procesare", color: "#06b6d4" },
  { status: "respinsa", label: "Respinse", color: "#ef4444" },
];

const FINAL_STATUSES = ["aprobata", "respinsa"];
const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

/**
 * Compute trend by comparing current 30-day count to prior 30-day count.
 */
async function computeTrend(
  supabase: DbClient,
  table: "utilizatori" | "user_primarii",
  primarieId: string,
  filters?: Record<string, string>
): Promise<{ value: number; isPositive: boolean }> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const primarieColumn = table === "user_primarii" ? "primarie_id" : "primarie_id";

  let currentQuery = supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(primarieColumn, primarieId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  let priorQuery = supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq(primarieColumn, primarieId)
    .gte("created_at", sixtyDaysAgo.toISOString())
    .lt("created_at", thirtyDaysAgo.toISOString());

  if (filters) {
    for (const [key, val] of Object.entries(filters)) {
      currentQuery = currentQuery.eq(key, val);
      priorQuery = priorQuery.eq(key, val);
    }
  }

  const [{ count: current }, { count: prior }] = await Promise.all([currentQuery, priorQuery]);
  const currentCount = current ?? 0;
  const priorCount = prior ?? 0;

  if (priorCount === 0) return { value: currentCount > 0 ? 100 : 0, isPositive: true };

  const change = Math.round(((currentCount - priorCount) / priorCount) * 100);
  return { value: Math.abs(change), isPositive: change >= 0 };
}

/**
 * Compute SLA compliance: % of finalized cereri resolved within deadline.
 */
export async function computeSlaCompliance(
  supabase: DbClient,
  primarieId: string
): Promise<number> {
  const { data: finalCereri } = await supabase
    .from("cereri")
    .select("data_termen, data_finalizare")
    .eq("primarie_id", primarieId)
    .in("status", FINAL_STATUSES)
    .not("data_termen", "is", null)
    .not("data_finalizare", "is", null);

  if (!finalCereri || finalCereri.length === 0) return 100;

  const withinSla = finalCereri.filter(
    (c) => new Date(c.data_finalizare!) <= new Date(c.data_termen!)
  ).length;

  return Math.round((withinSla / finalCereri.length) * 100);
}

export async function fetchUserStats(
  supabase: DbClient,
  primarieId: string
): Promise<UserStatsData> {
  // Count users by role from user_primarii (scoped to primarie)
  const roles = ["cetatean", "functionar", "primar", "admin"] as const;

  const [roleCounts, pendingCount, cetateniTrend, functionariTrend, pendingTrend] =
    await Promise.all([
      Promise.all(
        roles.map(async (rol) => {
          let query = supabase
            .from("user_primarii")
            .select("*", { count: "exact", head: true })
            .eq("primarie_id", primarieId)
            .eq("status", "approved");

          if (rol === "admin") {
            query = query.in("rol", ["admin", "super_admin"]);
          } else {
            query = query.eq("rol", rol);
          }

          const { count } = await query;
          return { rol, count: count ?? 0 };
        })
      ),
      supabase
        .from("user_primarii")
        .select("*", { count: "exact", head: true })
        .eq("primarie_id", primarieId)
        .eq("status", "pending")
        .then(({ count }) => count ?? 0),
      computeTrend(supabase, "user_primarii", primarieId, { rol: "cetatean" }),
      computeTrend(supabase, "user_primarii", primarieId, { rol: "functionar" }),
      computeTrend(supabase, "user_primarii", primarieId, { status: "pending" }),
    ]);

  const countMap = Object.fromEntries(roleCounts.map((r) => [r.rol, r.count]));

  return {
    cetateni: { count: countMap.cetatean ?? 0, trend: cetateniTrend },
    functionari: { count: countMap.functionar ?? 0, trend: functionariTrend },
    primar: { count: countMap.primar ?? 0 },
    admini: { count: countMap.admin ?? 0 },
    pending: { count: pendingCount, trend: pendingTrend },
  };
}

export async function fetchCereriOverview(
  supabase: DbClient,
  primarieId: string
): Promise<CereriOverviewItem[]> {
  const counts = await Promise.all(
    CERERI_STATUS_MAP.map(async ({ status, label, color }) => {
      const { count } = await supabase
        .from("cereri")
        .select("*", { count: "exact", head: true })
        .eq("primarie_id", primarieId)
        .eq("status", status)
        .is("deleted_at", null);

      return { status, label, count: count ?? 0, color };
    })
  );

  return counts;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(1)} ${units[i]}`;
}

export async function fetchHealthMetrics(
  supabase: DbClient,
  primarieId: string
): Promise<HealthMetricsData> {
  const { data: healthCheck } = await supabase
    .from("health_checks" as never)
    .select("*")
    .eq("primarie_id", primarieId)
    .order("checked_at", { ascending: false })
    .limit(1)
    .single();

  if (!healthCheck) {
    return {
      dbLoad: { value: 0, max: 100 },
      storage: { usedBytes: 0, label: "0 B" },
      apiResponse: { avgMs: 0 },
      activeSessions: { count: 0 },
    };
  }

  const hc = healthCheck as Record<string, unknown>;
  const activeConn = (hc.db_active_connections as number) ?? 0;
  const maxConn = (hc.db_max_connections as number) ?? 100;
  const storageBytes = (hc.storage_bytes_used as number) ?? 0;
  const responseMs = (hc.response_time_ms as number) ?? 0;
  const sessions = (hc.active_sessions as number) ?? 0;

  return {
    dbLoad: { value: Math.round((activeConn / maxConn) * 100), max: maxConn },
    storage: { usedBytes: storageBytes, label: formatBytes(storageBytes) },
    apiResponse: { avgMs: responseMs },
    activeSessions: { count: sessions },
  };
}

export async function fetchAdminAlerts(
  supabase: DbClient,
  primarieId: string
): Promise<AdminAlert[]> {
  const now = new Date();
  const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const [pendingRegs, slaApproaching, stuckCereri, inactiveFunctionari, unreadNotifications] =
    await Promise.all([
      // 1. Pending registrations
      supabase
        .from("user_primarii")
        .select("*", { count: "exact", head: true })
        .eq("primarie_id", primarieId)
        .eq("status", "pending")
        .then(({ count }) => count ?? 0),

      // 2. SLA approaching (data_termen within next 24h, not in final status)
      supabase
        .from("cereri")
        .select("*", { count: "exact", head: true })
        .eq("primarie_id", primarieId)
        .is("deleted_at", null)
        .not("status", "in", `(${FINAL_STATUSES.join(",")})`)
        .not("data_termen", "is", null)
        .lte("data_termen", twentyFourHoursFromNow.toISOString())
        .gte("data_termen", now.toISOString())
        .then(({ count }) => count ?? 0),

      // 3. Stuck cereri (not updated in 72h, not in final status)
      supabase
        .from("cereri")
        .select("*", { count: "exact", head: true })
        .eq("primarie_id", primarieId)
        .is("deleted_at", null)
        .not("status", "in", `(${FINAL_STATUSES.join(",")})`)
        .lte("updated_at", seventyTwoHoursAgo.toISOString())
        .then(({ count }) => count ?? 0),

      // 4. Inactive functionari (no login in 48h)
      supabase
        .from("user_primarii")
        .select("user_id", { count: "exact", head: false })
        .eq("primarie_id", primarieId)
        .eq("rol", "functionar")
        .eq("status", "approved")
        .then(async ({ data: userPrimarii }) => {
          if (!userPrimarii || userPrimarii.length === 0) return 0;
          const userIds = userPrimarii.map((up) => up.user_id);
          const { count } = await supabase
            .from("utilizatori")
            .select("*", { count: "exact", head: true })
            .in("id", userIds)
            .or(`last_login_at.is.null,last_login_at.lte.${fortyEightHoursAgo.toISOString()}`);
          return count ?? 0;
        }),

      // 5. Unread notifications for admins of this primarie
      supabase
        .from("user_primarii")
        .select("user_id")
        .eq("primarie_id", primarieId)
        .in("rol", ["admin", "super_admin"])
        .eq("status", "approved")
        .then(async ({ data: adminUsers }) => {
          if (!adminUsers || adminUsers.length === 0) return 0;
          const adminIds = adminUsers.map((u) => u.user_id);
          const { count } = await supabase
            .from("notificari")
            .select("*", { count: "exact", head: true })
            .in("utilizator_id", adminIds)
            .eq("citita", false);
          return count ?? 0;
        }),
    ]);

  const alerts: AdminAlert[] = [];

  if (pendingRegs > 0) {
    alerts.push({
      id: "pending-registrations",
      title: "Inregistrari in asteptare",
      description: `${pendingRegs} utilizator${pendingRegs > 1 ? "i" : ""} asteapta aprobare`,
      severity: "warning",
      actionLabel: "Aproba",
      actionHref: "admin/users",
      count: pendingRegs,
    });
  }

  if (slaApproaching > 0) {
    alerts.push({
      id: "sla-approaching",
      title: "Termen SLA aproape",
      description: `${slaApproaching} cerer${slaApproaching > 1 ? "i" : "e"} expira in 24h`,
      severity: "urgent",
      actionLabel: "Vezi",
      actionHref: "admin/cereri",
      count: slaApproaching,
    });
  }

  if (stuckCereri > 0) {
    alerts.push({
      id: "stuck-cereri",
      title: "Cereri blocate",
      description: `${stuckCereri} cerer${stuckCereri > 1 ? "i" : "e"} fara actualizare >72h`,
      severity: "warning",
      actionLabel: "Verifica",
      actionHref: "admin/cereri",
      count: stuckCereri,
    });
  }

  if (inactiveFunctionari > 0) {
    alerts.push({
      id: "inactive-functionari",
      title: "Functionari inactivi",
      description: `${inactiveFunctionari} functionar${inactiveFunctionari > 1 ? "i" : ""} fara activitate >48h`,
      severity: "info",
      actionLabel: "Contacteaza",
      actionHref: "admin/users",
      count: inactiveFunctionari,
    });
  }

  if (unreadNotifications > 0) {
    alerts.push({
      id: "unread-notifications",
      title: "Notificari necitite",
      description: `${unreadNotifications} notificar${unreadNotifications > 1 ? "i" : "e"} necitit${unreadNotifications > 1 ? "e" : "a"}`,
      severity: "system",
      actionLabel: "Citeste",
      actionHref: "admin/notificari",
      count: unreadNotifications,
    });
  }

  return alerts;
}

export async function fetchFunctionariPerformance(
  supabase: DbClient,
  primarieId: string
): Promise<FunctionarPerformance[]> {
  // Get functionari from user_primarii
  const { data: functionarLinks } = await supabase
    .from("user_primarii")
    .select("user_id")
    .eq("primarie_id", primarieId)
    .eq("rol", "functionar")
    .eq("status", "approved");

  if (!functionarLinks || functionarLinks.length === 0) return [];

  const userIds = functionarLinks.map((f) => f.user_id);

  // Get user details
  const { data: functionari } = await supabase
    .from("utilizatori")
    .select("id, nume, prenume, last_login_at")
    .in("id", userIds);

  if (!functionari || functionari.length === 0) return [];

  const now = Date.now();

  // For each functionar, count resolved cereri
  const performance = await Promise.all(
    functionari.map(async (f) => {
      const [{ count: totalAssigned }, { count: resolved }] = await Promise.all([
        supabase
          .from("cereri")
          .select("*", { count: "exact", head: true })
          .eq("primarie_id", primarieId)
          .eq("preluat_de_id", f.id)
          .is("deleted_at", null),
        supabase
          .from("cereri")
          .select("*", { count: "exact", head: true })
          .eq("primarie_id", primarieId)
          .eq("preluat_de_id", f.id)
          .in("status", FINAL_STATUSES)
          .is("deleted_at", null),
      ]);

      const total = totalAssigned ?? 0;
      const resolvedCount = resolved ?? 0;
      const rate = total > 0 ? Math.round((resolvedCount / total) * 100) : 0;

      const firstInitial = (f.prenume?.[0] ?? "").toUpperCase();
      const lastInitial = (f.nume?.[0] ?? "").toUpperCase();

      const isOnline = f.last_login_at
        ? now - new Date(f.last_login_at).getTime() < FIFTEEN_MINUTES_MS
        : false;

      return {
        id: f.id,
        name: `${f.prenume} ${f.nume}`,
        initials: `${firstInitial}${lastInitial}`,
        cereriResolved: resolvedCount,
        resolutionRate: rate,
        isOnline,
      };
    })
  );

  return performance;
}

export async function fetchActivityData(
  supabase: DbClient,
  primarieId: string
): Promise<ActivityDataPoint[]> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { data: cereri } = await supabase
    .from("cereri")
    .select("created_at")
    .eq("primarie_id", primarieId)
    .is("deleted_at", null)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  if (!cereri || cereri.length === 0) return [];

  // Group by date
  const dateCountMap = new Map<string, number>();
  for (const c of cereri) {
    if (!c.created_at) continue;
    const date = new Date(c.created_at);
    const key = date.toLocaleDateString("ro-RO", { month: "short", day: "numeric" });
    dateCountMap.set(key, (dateCountMap.get(key) ?? 0) + 1);
  }

  return Array.from(dateCountMap.entries()).map(([date, value]) => ({ date, value }));
}

async function fetchWelcomeBannerData(
  supabase: DbClient,
  primarieId: string,
  adminName: string,
  primarieName: string,
  judetName: string
): Promise<WelcomeBannerData> {
  const [
    uptimePercent,
    cereriResolutionPercent,
    slaCompliancePercent,
    pendingRegistrations,
    onlineFunctionari,
    alertCount,
  ] = await Promise.all([
    // Uptime from health checks (% of successful checks in last 24h)
    supabase
      .from("health_checks" as never)
      .select("uptime_status")
      .eq("primarie_id", primarieId)
      .gte("checked_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .then(({ data }) => {
        if (!data || data.length === 0) return 99.9;
        const checks = data as { uptime_status: boolean }[];
        const successCount = checks.filter((c) => c.uptime_status).length;
        return Math.round((successCount / checks.length) * 1000) / 10;
      }),

    // Cereri resolution rate
    (async () => {
      const [{ count: total }, { count: resolved }] = await Promise.all([
        supabase
          .from("cereri")
          .select("*", { count: "exact", head: true })
          .eq("primarie_id", primarieId)
          .is("deleted_at", null),
        supabase
          .from("cereri")
          .select("*", { count: "exact", head: true })
          .eq("primarie_id", primarieId)
          .in("status", FINAL_STATUSES)
          .is("deleted_at", null),
      ]);
      const t = total ?? 0;
      const r = resolved ?? 0;
      return t > 0 ? Math.round((r / t) * 100) : 100;
    })(),

    computeSlaCompliance(supabase, primarieId),

    supabase
      .from("user_primarii")
      .select("*", { count: "exact", head: true })
      .eq("primarie_id", primarieId)
      .eq("status", "pending")
      .then(({ count }) => count ?? 0),

    // Online functionari
    supabase
      .from("user_primarii")
      .select("user_id")
      .eq("primarie_id", primarieId)
      .eq("rol", "functionar")
      .eq("status", "approved")
      .then(async ({ data: links }) => {
        if (!links || links.length === 0) return 0;
        const { count } = await supabase
          .from("utilizatori")
          .select("*", { count: "exact", head: true })
          .in(
            "id",
            links.map((l) => l.user_id)
          )
          .gte("last_login_at", new Date(Date.now() - FIFTEEN_MINUTES_MS).toISOString());
        return count ?? 0;
      }),

    // Alert count (simplified - just pending + stuck)
    Promise.all([
      supabase
        .from("user_primarii")
        .select("*", { count: "exact", head: true })
        .eq("primarie_id", primarieId)
        .eq("status", "pending")
        .then(({ count }) => count ?? 0),
      supabase
        .from("cereri")
        .select("*", { count: "exact", head: true })
        .eq("primarie_id", primarieId)
        .is("deleted_at", null)
        .not("status", "in", `(${FINAL_STATUSES.join(",")})`)
        .lte("updated_at", new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
        .then(({ count }) => count ?? 0),
    ]).then(([a, b]) => a + b),
  ]);

  return {
    adminName,
    primarieName,
    judetName,
    uptimePercent,
    cereriResolutionPercent,
    slaCompliancePercent,
    pendingRegistrations,
    onlineFunctionari,
    alertCount,
  };
}

/**
 * Master function: fetches all dashboard data in parallel.
 */
export async function fetchDashboardData(
  supabase: DbClient,
  primarieId: string,
  adminName: string = "Admin",
  primarieName: string = "",
  judetName: string = ""
): Promise<DashboardData> {
  const [welcome, userStats, cereriOverview, healthMetrics, alerts, performance, activityData] =
    await Promise.all([
      fetchWelcomeBannerData(supabase, primarieId, adminName, primarieName, judetName),
      fetchUserStats(supabase, primarieId),
      fetchCereriOverview(supabase, primarieId),
      fetchHealthMetrics(supabase, primarieId),
      fetchAdminAlerts(supabase, primarieId),
      fetchFunctionariPerformance(supabase, primarieId),
      fetchActivityData(supabase, primarieId),
    ]);

  return {
    welcome,
    userStats,
    cereriOverview,
    healthMetrics,
    performance,
    alerts,
    activityData,
  };
}
