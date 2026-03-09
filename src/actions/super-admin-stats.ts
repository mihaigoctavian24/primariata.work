"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

// ============================================================================
// Helpers
// ============================================================================

function firstDayOfCurrentMonth(): string {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
}

function firstDayOfPastYear(): string {
  const d = new Date();
  return new Date(d.getFullYear() - 1, d.getMonth(), 1).toISOString();
}

// ============================================================================
// Types
// ============================================================================

interface DashboardStats {
  totalPrimarii: number;
  activePrimarii: number;
  totalUsers: number;
  totalCereri: number;
  cereriThisMonth: number;
  mrr: number;
}

interface PrimarieRow {
  id: string;
  name: string; // nume_oficial
  judet: string; // judete.cod
  localitate: string; // localitati.nume
  status: string; // primarii.status from DB
  tier: string; // primarii.tier from DB
  uptime: number | null; // primarii.uptime from DB
  satisfactionScore: number | null; // primarii.satisfaction_score from DB
  avgResponseTime: string | null; // primarii.avg_response_time from DB
  adminName: string | null;
  adminEmail: string | null;
  usersCount: number;
  cereriTotal: number;
  cereriMonth: number;
  revenue: number;
  createdAt: string;
}

interface AdminRow {
  id: string;
  name: string; // prenume + " " + nume
  email: string;
  primarie: string | null; // primarie nume_oficial
  judet: string | null; // judete.cod
  status: string; // mapped from user_primarii.status
  invitedAt: string; // user_primarii.created_at
  cereriSupervised: number;
  usersManaged: number;
  twoFA: boolean; // utilizatori.two_fa_enabled
  role: string; // utilizatori.rol
}

interface AuditEntry {
  id: string;
  actiune: string;
  detalii: Record<string, unknown> | null;
  ipAddress: string | null; // audit_log.ip_address — now string | null after migration
  createdAt: string;
  actorName: string; // from audit_log.utilizator_nume directly
  actorEmail: string; // from audit_log.utilizator_id (show as ID if email not available)
  primarieName: string | null;
}

// ============================================================================
// Function 1: getDashboardStats
// ============================================================================

/**
 * Fetch platform-wide dashboard statistics for super admin.
 * Bypasses RLS using service role client.
 * Verifies super_admin role before executing queries.
 */
export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Neautentificat" };
    const { data: userData } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();
    if (!userData || userData.rol !== "super_admin")
      return { success: false, error: "Acces interzis" };

    const serviceSupabase = createServiceRoleClient();
    const [primariiResult, usersResult, cereriResult, cereriMonthResult, platiResult] =
      await Promise.all([
        serviceSupabase.from("primarii").select("id, status"),
        serviceSupabase.from("utilizatori").select("id", { count: "exact", head: true }),
        serviceSupabase.from("cereri").select("id", { count: "exact", head: true }),
        serviceSupabase
          .from("cereri")
          .select("id", { count: "exact", head: true })
          .gte("created_at", firstDayOfCurrentMonth()),
        serviceSupabase
          .from("plati")
          .select("suma")
          .eq("status", "completed")
          .gte("created_at", firstDayOfCurrentMonth()),
      ]);

    const primariiData = primariiResult.data ?? [];
    const totalPrimarii = primariiData.length;
    const activePrimarii = primariiData.filter((p) => p.status === "active").length;
    const totalUsers = usersResult.count ?? 0;
    const totalCereri = cereriResult.count ?? 0;
    const cereriThisMonth = cereriMonthResult.count ?? 0;
    const mrr = (platiResult.data ?? []).reduce(
      (sum: number, p: { suma: number }) => sum + (p.suma || 0),
      0
    );

    return {
      success: true,
      data: {
        totalPrimarii,
        activePrimarii,
        totalUsers,
        totalCereri,
        cereriThisMonth,
        mrr,
      },
    };
  } catch (error) {
    logger.error("Unexpected error in getDashboardStats:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// Function 2: getPrimariiList
// ============================================================================

/**
 * Fetch all primarii with full details for super admin list view.
 * Assembles data in JS by joining localitati, judete, user_primarii, utilizatori, cereri, plati.
 * Bypasses RLS using service role client.
 */
export async function getPrimariiList(): Promise<{
  success: boolean;
  data?: PrimarieRow[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Neautentificat" };
    const { data: userData } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();
    if (!userData || userData.rol !== "super_admin")
      return { success: false, error: "Acces interzis" };

    const serviceSupabase = createServiceRoleClient();
    const [
      primariiResult,
      localitatiResult,
      judeteResult,
      userPrimariiResult,
      utilizatoriResult,
      cereriResult,
      platiResult,
    ] = await Promise.all([
      serviceSupabase
        .from("primarii")
        .select(
          "id, nume_oficial, status, tier, uptime, satisfaction_score, avg_response_time, created_at, localitate_id, config"
        ),
      serviceSupabase.from("localitati").select("id, nume, judet_id"),
      serviceSupabase.from("judete").select("id, nume, cod"),
      serviceSupabase.from("user_primarii").select("primarie_id, user_id, rol, status"),
      serviceSupabase.from("utilizatori").select("id, prenume, nume, email"),
      serviceSupabase
        .from("cereri")
        .select("id, primarie_id, created_at")
        .gte("created_at", firstDayOfPastYear())
        .limit(5000),
      serviceSupabase
        .from("plati")
        .select("cerere_id, suma, status")
        .eq("status", "completed")
        .limit(500),
    ]);

    const primarii = primariiResult.data ?? [];
    const localitatiMap = new Map((localitatiResult.data ?? []).map((l) => [l.id, l]));
    const judeteMap = new Map((judeteResult.data ?? []).map((j) => [j.id, j]));
    const allUserPrimarii = userPrimariiResult.data ?? [];
    const utilizatoriMap = new Map((utilizatoriResult.data ?? []).map((u) => [u.id, u]));
    const allCereri = cereriResult.data ?? [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const rows: PrimarieRow[] = primarii.map((primarie) => {
      // Localitate + judet
      const localitate = primarie.localitate_id ? localitatiMap.get(primarie.localitate_id) : null;
      const judet = localitate?.judet_id != null ? judeteMap.get(localitate.judet_id) : null;

      // Find admin user for this primarie
      const adminAssociation = allUserPrimarii.find(
        (up) =>
          up.primarie_id === primarie.id &&
          ["admin", "primar"].includes(up.rol) &&
          up.status === "approved"
      );
      const adminUser = adminAssociation ? utilizatoriMap.get(adminAssociation.user_id) : null;

      // Users count (all associations)
      const usersCount = allUserPrimarii.filter((up) => up.primarie_id === primarie.id).length;

      // Cereri counts
      const primarieCereri = allCereri.filter((c) => c.primarie_id === primarie.id);
      const cereriTotal = primarieCereri.length;
      const cereriMonth = primarieCereri.filter(
        (c) => c.created_at && new Date(c.created_at) >= monthStart
      ).length;

      // Revenue — sum plati where cerere belongs to this primarie
      // We don't have a direct primarie_id on the cereri subset we fetched, so
      // match by cerere_id intersection
      const primarieCereriIds = new Set(primarieCereri.map((c) => c.id));
      const revenue = (platiResult.data ?? [])
        .filter((p) => p.cerere_id && primarieCereriIds.has(p.cerere_id))
        .reduce((sum: number, p: { suma: number }) => sum + (p.suma || 0), 0);

      // Tier fallback: DB column first, then config.tier, then "Basic"
      const rawConfig = primarie.config as Record<string, unknown> | null;
      const tier = primarie.tier ?? (rawConfig?.tier as string | undefined) ?? "Basic";

      return {
        id: primarie.id,
        name: primarie.nume_oficial,
        judet: judet?.cod ?? "",
        localitate: localitate?.nume ?? "",
        status: primarie.status ?? "inactive",
        tier,
        uptime: primarie.uptime ?? null,
        satisfactionScore: primarie.satisfaction_score ?? null,
        avgResponseTime: primarie.avg_response_time ?? null,
        adminName: adminUser ? `${adminUser.prenume} ${adminUser.nume}` : null,
        adminEmail: adminUser?.email ?? null,
        usersCount,
        cereriTotal,
        cereriMonth,
        revenue,
        createdAt: primarie.created_at ?? "",
      };
    });

    return { success: true, data: rows };
  } catch (error) {
    logger.error("Unexpected error in getPrimariiList:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// Function 3: getAdminsList
// ============================================================================

/**
 * Fetch all admin-level users with their associated primarie details.
 * Bypasses RLS using service role client.
 * Verifies super_admin role before executing queries.
 */
export async function getAdminsList(): Promise<{
  success: boolean;
  data?: AdminRow[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Neautentificat" };
    const { data: userData } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();
    if (!userData || userData.rol !== "super_admin")
      return { success: false, error: "Acces interzis" };

    const serviceSupabase = createServiceRoleClient();
    const [
      adminsResult,
      userPrimariiResult,
      primariiResult,
      localitatiResult,
      judeteResult,
      cereriResult,
    ] = await Promise.all([
      serviceSupabase
        .from("utilizatori")
        .select("id, prenume, nume, email, rol, two_fa_enabled, created_at")
        .in("rol", ["admin", "primar"]),
      serviceSupabase.from("user_primarii").select("user_id, primarie_id, rol, status, created_at"),
      serviceSupabase.from("primarii").select("id, nume_oficial, localitate_id"),
      serviceSupabase.from("localitati").select("id, judet_id, nume"),
      serviceSupabase.from("judete").select("id, cod"),
      serviceSupabase.from("cereri").select("id, preluat_de_id").limit(1000),
    ]);

    const admins = adminsResult.data ?? [];
    const allUserPrimarii = userPrimariiResult.data ?? [];
    const primariiMap = new Map((primariiResult.data ?? []).map((p) => [p.id, p]));
    const localitatiMap = new Map((localitatiResult.data ?? []).map((l) => [l.id, l]));
    const judeteMap = new Map((judeteResult.data ?? []).map((j) => [j.id, j]));
    const allCereri = cereriResult.data ?? [];

    const rows: AdminRow[] = admins.map((admin) => {
      // Find association (approved or pending)
      const association = allUserPrimarii.find(
        (up) => up.user_id === admin.id && ["approved", "pending"].includes(up.status)
      );

      const primarie = association ? primariiMap.get(association.primarie_id) : null;
      const localitate =
        primarie?.localitate_id != null ? localitatiMap.get(primarie.localitate_id) : null;
      const judet = localitate?.judet_id != null ? judeteMap.get(localitate.judet_id) : null;

      // Map status
      let status: string;
      if (!association) {
        status = "suspended";
      } else if (association.status === "approved") {
        status = "active";
      } else if (association.status === "pending") {
        status = "pending";
      } else {
        status = "suspended";
      }

      // Cereri supervised (where this user took over a cerere)
      const cereriSupervised = allCereri.filter((c) => c.preluat_de_id === admin.id).length;

      // Other users in the same primarie
      const usersManaged = association
        ? allUserPrimarii.filter(
            (up) => up.primarie_id === association.primarie_id && up.user_id !== admin.id
          ).length
        : 0;

      return {
        id: admin.id,
        name: `${admin.prenume} ${admin.nume}`,
        email: admin.email,
        primarie: primarie?.nume_oficial ?? null,
        judet: judet?.cod ?? null,
        status,
        invitedAt: association?.created_at ?? admin.created_at ?? "",
        cereriSupervised,
        usersManaged,
        twoFA: admin.two_fa_enabled,
        role: admin.rol,
      };
    });

    return { success: true, data: rows };
  } catch (error) {
    logger.error("Unexpected error in getAdminsList:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// Function 4: getAuditLog
// ============================================================================

/**
 * Fetch the last 100 audit log entries for super admin view.
 * Uses audit_log.utilizator_nume directly — no need to join utilizatori for actor name.
 * Bypasses RLS using service role client.
 */
export async function getAuditLog(): Promise<{
  success: boolean;
  data?: AuditEntry[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Neautentificat" };
    const { data: userData } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();
    if (!userData || userData.rol !== "super_admin")
      return { success: false, error: "Acces interzis" };

    const serviceSupabase = createServiceRoleClient();
    const [auditResult, primariiResult] = await Promise.all([
      serviceSupabase
        .from("audit_log")
        .select(
          "id, actiune, detalii, ip_address, created_at, utilizator_id, utilizator_nume, primarie_id"
        )
        .order("created_at", { ascending: false })
        .limit(100),
      serviceSupabase.from("primarii").select("id, nume_oficial"),
    ]);

    const primariiMap = new Map((primariiResult.data ?? []).map((p) => [p.id, p.nume_oficial]));

    const entries: AuditEntry[] = (auditResult.data ?? []).map((entry) => ({
      id: entry.id,
      actiune: entry.actiune,
      detalii: entry.detalii as Record<string, unknown> | null,
      ipAddress: entry.ip_address,
      createdAt: entry.created_at ?? "",
      actorName: entry.utilizator_nume ?? "Necunoscut",
      actorEmail: entry.utilizator_id ?? "",
      primarieName: entry.primarie_id ? (primariiMap.get(entry.primarie_id) ?? null) : null,
    }));

    return { success: true, data: entries };
  } catch (error) {
    logger.error("Unexpected error in getAuditLog:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}
