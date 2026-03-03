"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { CerereStatusType } from "@/lib/validations/cereri";

// ============================================================================
// Types
// ============================================================================

interface ActionResult {
  success: boolean;
  error?: string;
}

interface FunctionarStats {
  pending: number;
  overdue: number;
  inProgress: number;
  completedToday: number;
}

interface AdminDashboardData {
  userCounts: {
    cetateni: number;
    functionari: number;
    admini: number;
    pending: number;
  };
  cereriOverview: Record<CerereStatusType, number>;
  recentActivity: Array<{
    id: string;
    tip: string;
    old_status: string | null;
    new_status: string | null;
    motiv: string | null;
    actor_name: string | null;
    created_at: string;
  }>;
}

interface PrimarDashboardData {
  approvalQueue: Array<{
    id: string;
    numar_inregistrare: string;
    tip_cerere_name: string;
    solicitant_name: string;
    created_at: string;
    data_termen: string | null;
    status: string;
  }>;
  financialOverview: {
    totalRevenue: number;
    revenueThisMonth: number;
    revenueByType: Array<{ tipCerere: string; total: number }>;
  };
  staffMetrics: Array<{
    actor_id: string;
    actor_name: string;
    cereriProcessed: number;
    avgProcessingHours: number;
  }>;
  staffCount: number;
}

// ============================================================================
// Function 1: getFunctionarStats
// ============================================================================

/**
 * Fetch dashboard statistics for functionar role.
 * Returns counts for pending, overdue, in-progress, and completed-today cereri.
 * Uses RLS-filtered queries via x-primarie-id from middleware.
 */
export async function getFunctionarStats(): Promise<{
  success: boolean;
  data?: FunctionarStats;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // RLS filters by primarie automatically via x-primarie-id
    const { data: cereri, error } = await supabase
      .from("cereri")
      .select("id, status, data_termen, updated_at")
      .is("deleted_at", null)
      .not("status", "in", "(draft,anulata)");

    if (error) {
      logger.error("Database error in getFunctionarStats:", error);
      return { success: false, error: "Eroare la incarcarea statisticilor" };
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      success: true,
      data: {
        pending: (cereri ?? []).filter((c) => c.status === "depusa").length,
        overdue: (cereri ?? []).filter(
          (c) =>
            c.data_termen &&
            new Date(c.data_termen) < now &&
            !["finalizata", "respinsa", "anulata"].includes(c.status)
        ).length,
        inProgress: (cereri ?? []).filter((c) =>
          ["in_verificare", "in_procesare", "in_aprobare"].includes(c.status)
        ).length,
        completedToday: (cereri ?? []).filter(
          (c) =>
            ["finalizata", "respinsa"].includes(c.status) &&
            c.updated_at &&
            new Date(c.updated_at) >= todayStart
        ).length,
      },
    };
  } catch (error) {
    logger.error("Unexpected error in getFunctionarStats:", error);
    return { success: false, error: "Eroare la incarcarea statisticilor" };
  }
}

// ============================================================================
// Function 2: getAdminDashboardData
// ============================================================================

/**
 * Fetch dashboard data for admin role.
 * Returns user counts by role, cereri status overview, and recent activity feed.
 * Uses RLS-filtered queries via x-primarie-id from middleware.
 */
export async function getAdminDashboardData(): Promise<{
  success: boolean;
  data?: AdminDashboardData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // Parallel queries for user counts, cereri overview, and recent activity
    const [usersResult, pendingResult, cereriResult, activityResult] = await Promise.all([
      // Approved users grouped by role (RLS filters by primarie)
      supabase.from("user_primarii").select("rol").eq("status", "approved"),
      // Pending registrations count
      supabase
        .from("user_primarii")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      // Cereri for status overview (RLS filters by primarie)
      supabase.from("cereri").select("status").is("deleted_at", null),
      // Recent activity from cerere_istoric
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("cerere_istoric")
        .select("id, tip, old_status, new_status, motiv, actor_id, created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Process user counts
    const users = usersResult.data ?? [];
    const userCounts = {
      cetateni: users.filter((u) => u.rol === "cetatean").length,
      functionari: users.filter((u) => u.rol === "functionar").length,
      admini: users.filter((u) => ["admin", "primar"].includes(u.rol)).length,
      pending: pendingResult.count ?? 0,
    };

    // Process cereri overview - count per status
    const cereriOverview = {} as Record<CerereStatusType, number>;
    for (const cerere of cereriResult.data ?? []) {
      const status = cerere.status as CerereStatusType;
      cereriOverview[status] = (cereriOverview[status] ?? 0) + 1;
    }

    // Process recent activity - hydrate actor names
    const activityEntries = (activityResult.data ?? []) as Array<{
      id: string;
      tip: string;
      old_status: string | null;
      new_status: string | null;
      motiv: string | null;
      actor_id: string | null;
      created_at: string;
    }>;

    const actorIds = [
      ...new Set(activityEntries.map((e) => e.actor_id).filter(Boolean)),
    ] as string[];

    let actorMap = new Map<string, { prenume: string; nume: string }>();
    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from("utilizatori")
        .select("id, prenume, nume")
        .in("id", actorIds);

      if (actors) {
        actorMap = new Map(actors.map((a) => [a.id, { prenume: a.prenume, nume: a.nume }]));
      }
    }

    const recentActivity = activityEntries.map((entry) => {
      const actor = entry.actor_id ? actorMap.get(entry.actor_id) : null;
      return {
        id: entry.id,
        tip: entry.tip,
        old_status: entry.old_status,
        new_status: entry.new_status,
        motiv: entry.motiv,
        actor_name: actor ? `${actor.prenume} ${actor.nume}` : null,
        created_at: entry.created_at,
      };
    });

    return {
      success: true,
      data: {
        userCounts,
        cereriOverview,
        recentActivity,
      },
    };
  } catch (error) {
    logger.error("Unexpected error in getAdminDashboardData:", error);
    return { success: false, error: "Eroare la incarcarea datelor dashboard-ului" };
  }
}

// ============================================================================
// Function 3: getPrimarDashboardData
// ============================================================================

/**
 * Fetch dashboard data for primar role.
 * Returns approval queue, financial overview, and staff processing metrics.
 * Uses RLS-filtered queries via x-primarie-id from middleware.
 */
export async function getPrimarDashboardData(): Promise<{
  success: boolean;
  data?: PrimarDashboardData;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // Parallel queries for approval queue, payments, activity, and staff count
    const [approvalResult, platiResult, istoricResult, staffResult] = await Promise.all([
      // Approval queue: cereri with status in_aprobare
      supabase
        .from("cereri")
        .select(
          "id, numar_inregistrare, created_at, data_termen, status, tip_cerere:tipuri_cereri(nume), solicitant:utilizatori!cereri_solicitant_id_fkey(prenume, nume)"
        )
        .eq("status", "in_aprobare")
        .is("deleted_at", null)
        .order("data_termen", { ascending: true, nullsFirst: false }),
      // Financial overview: successful payments
      supabase
        .from("plati")
        .select("suma, created_at, cerere:cereri(tip_cerere:tipuri_cereri(nume))")
        .eq("status", "success"),
      // Staff metrics: status changes from cerere_istoric
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase as any)
        .from("cerere_istoric")
        .select("actor_id, created_at")
        .eq("tip", "status_change"),
      // Staff count: approved functionari
      supabase
        .from("user_primarii")
        .select("id", { count: "exact", head: true })
        .eq("status", "approved")
        .eq("rol", "functionar"),
    ]);

    // Process approval queue
    const approvalQueue = (approvalResult.data ?? []).map(
      (c: {
        id: string;
        numar_inregistrare: string;
        created_at: string | null;
        data_termen: string | null;
        status: string;
        tip_cerere: { nume: string } | null;
        solicitant: { prenume: string; nume: string } | null;
      }) => ({
        id: c.id,
        numar_inregistrare: c.numar_inregistrare,
        tip_cerere_name: c.tip_cerere?.nume ?? "Necunoscut",
        solicitant_name: c.solicitant
          ? `${c.solicitant.prenume} ${c.solicitant.nume}`
          : "Necunoscut",
        created_at: c.created_at ?? "",
        data_termen: c.data_termen,
        status: c.status,
      })
    );

    // Process financial overview
    const plati = platiResult.data ?? [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRevenue = plati.reduce((sum: number, p: { suma: number }) => sum + (p.suma || 0), 0);
    const revenueThisMonth = plati
      .filter((p: { created_at: string }) => new Date(p.created_at) >= monthStart)
      .reduce((sum: number, p: { suma: number }) => sum + (p.suma || 0), 0);

    // Group revenue by cerere type (top 5)
    const typeMap = new Map<string, number>();
    for (const p of plati) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tipName = (p as any).cerere?.tip_cerere?.nume ?? "Altele";
      typeMap.set(tipName, (typeMap.get(tipName) ?? 0) + ((p as { suma: number }).suma ?? 0));
    }
    const revenueByType = [...typeMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tipCerere, total]) => ({ tipCerere, total }));

    // Process staff metrics
    const istoricEntries = (istoricResult.data ?? []) as Array<{
      actor_id: string | null;
      created_at: string;
    }>;

    // Group by actor_id and calculate metrics
    const actorMetricsMap = new Map<string, { count: number; timestamps: number[] }>();
    for (const entry of istoricEntries) {
      if (!entry.actor_id) continue;
      const existing = actorMetricsMap.get(entry.actor_id) ?? {
        count: 0,
        timestamps: [],
      };
      existing.count += 1;
      existing.timestamps.push(new Date(entry.created_at).getTime());
      actorMetricsMap.set(entry.actor_id, existing);
    }

    // Hydrate actor names
    const staffActorIds = [...actorMetricsMap.keys()];
    let staffActorMap = new Map<string, { prenume: string; nume: string }>();
    if (staffActorIds.length > 0) {
      const { data: actors } = await supabase
        .from("utilizatori")
        .select("id, prenume, nume")
        .in("id", staffActorIds);

      if (actors) {
        staffActorMap = new Map(actors.map((a) => [a.id, { prenume: a.prenume, nume: a.nume }]));
      }
    }

    const staffMetrics = [...actorMetricsMap.entries()].map(([actorId, metrics]) => {
      const actor = staffActorMap.get(actorId);
      // Calculate average processing hours from timestamps
      const sortedTs = metrics.timestamps.sort((a, b) => a - b);
      let avgHours = 0;
      if (sortedTs.length > 1) {
        const diffs: number[] = [];
        for (let i = 1; i < sortedTs.length; i++) {
          const curr = sortedTs[i];
          const prev = sortedTs[i - 1];
          if (curr !== undefined && prev !== undefined) {
            diffs.push(curr - prev);
          }
        }
        const avgMs = diffs.reduce((sum, d) => sum + d, 0) / diffs.length;
        avgHours = Math.round((avgMs / (1000 * 60 * 60)) * 10) / 10;
      }
      return {
        actor_id: actorId,
        actor_name: actor ? `${actor.prenume} ${actor.nume}` : "Necunoscut",
        cereriProcessed: metrics.count,
        avgProcessingHours: avgHours,
      };
    });

    return {
      success: true,
      data: {
        approvalQueue,
        financialOverview: {
          totalRevenue,
          revenueThisMonth,
          revenueByType,
        },
        staffMetrics,
        staffCount: staffResult.count ?? 0,
      },
    };
  } catch (error) {
    logger.error("Unexpected error in getPrimarDashboardData:", error);
    return { success: false, error: "Eroare la incarcarea datelor dashboard-ului" };
  }
}

// ============================================================================
// Function 4: updatePrimarieSettings
// ============================================================================

/**
 * Update primarie settings (email, phone, address, working hours, notification config).
 * Verifies admin/primar role before updating. Uses service role client as
 * defense-in-depth alongside the RLS UPDATE policy.
 */
export async function updatePrimarieSettings(
  primarieId: string,
  data: {
    email?: string;
    telefon?: string;
    adresa?: string;
    program_lucru?: string;
    config?: {
      notificari_registrari?: boolean;
      notificari_cereri?: boolean;
    };
  }
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // Verify admin/primar role
    const { data: userPrimarie } = await supabase
      .from("user_primarii")
      .select("rol")
      .eq("user_id", user.id)
      .eq("primarie_id", primarieId)
      .eq("status", "approved")
      .single();

    if (!userPrimarie || !["admin", "primar"].includes(userPrimarie.rol)) {
      return { success: false, error: "Acces interzis" };
    }

    // Build update payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.telefon !== undefined) updatePayload.telefon = data.telefon;
    if (data.adresa !== undefined) updatePayload.adresa = data.adresa;
    if (data.program_lucru !== undefined) updatePayload.program_lucru = data.program_lucru;

    // If config is provided, merge with existing config JSONB
    if (data.config) {
      const serviceClient = createServiceRoleClient();
      const { data: currentPrimarie } = await serviceClient
        .from("primarii")
        .select("config")
        .eq("id", primarieId)
        .single();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const currentConfig = (currentPrimarie?.config as Record<string, any>) ?? {};
      updatePayload.config = { ...currentConfig, ...data.config };
    }

    // Use service role for the actual UPDATE as defense-in-depth
    const serviceClient = createServiceRoleClient();
    const { error: updateError } = await serviceClient
      .from("primarii")
      .update(updatePayload)
      .eq("id", primarieId);

    if (updateError) {
      logger.error("Database error updating primarie settings:", updateError);
      return { success: false, error: "Eroare la salvarea setarilor" };
    }

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in updatePrimarieSettings:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

// ============================================================================
// Function 5: getPrimarieSettings
// ============================================================================

/**
 * Fetch primarie settings for admin settings form pre-fill.
 * Returns primarie info and notification config with defaults.
 * Uses RLS-filtered query via x-primarie-id from middleware.
 */
export async function getPrimarieSettings(): Promise<{
  success: boolean;
  data?: {
    id: string;
    email: string | null;
    telefon: string | null;
    adresa: string | null;
    program_lucru: string | null;
    nume_oficial: string;
    config: {
      notificari_registrari: boolean;
      notificari_cereri: boolean;
    } | null;
  };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // RLS + x-primarie-id filters to current primarie
    const { data: primarie, error } = await supabase
      .from("primarii")
      .select("id, email, telefon, adresa, program_lucru, nume_oficial, config")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Primaria nu a fost gasita" };
      }
      logger.error("Database error fetching primarie settings:", error);
      return { success: false, error: "Eroare la incarcarea setarilor" };
    }

    // Parse config JSONB - default notification preferences to true when missing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawConfig = primarie.config as Record<string, any> | null;
    const config = rawConfig
      ? {
          notificari_registrari: rawConfig.notificari_registrari ?? true,
          notificari_cereri: rawConfig.notificari_cereri ?? true,
        }
      : {
          notificari_registrari: true,
          notificari_cereri: true,
        };

    return {
      success: true,
      data: {
        id: primarie.id,
        email: primarie.email,
        telefon: primarie.telefon,
        adresa: primarie.adresa,
        program_lucru: primarie.program_lucru,
        nume_oficial: primarie.nume_oficial,
        config,
      },
    };
  } catch (error) {
    logger.error("Unexpected error in getPrimarieSettings:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}
