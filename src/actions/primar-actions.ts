"use server";

import { revalidatePath } from "next/cache";
import { getAuthContext } from "@/lib/auth/get-auth-context";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// Types
// ============================================================================

export interface DepartamentRow {
  id: string;
  primarie_id: string;
  nume: string;
  sef: string | null;
  nr_functionari: number;
  buget_alocat: number;
  created_at: string;
}

export interface ProiectRow {
  id: string;
  primarie_id: string;
  nume: string;
  categorie: string | null;
  status: "in_derulare" | "planificat" | "finalizat" | "intarziat";
  progres_pct: number;
  buget: number;
  buget_consumat: number;
  deadline: string | null;
  responsabil: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgendaEventRow {
  id: string;
  primarie_id: string;
  primar_id: string;
  titlu: string;
  data_eveniment: string;
  ora_start: string | null;
  ora_sfarsit: string | null;
  tip: "sedinta" | "audienta" | "eveniment" | "termen";
  descriere: string | null;
  created_at: string;
}

export interface CerereRow {
  id: string;
  numar_inregistrare: string;
  status: string;
  created_at: string;
  data_finalizare: string | null;
  escaladata: boolean;
  prioritate: string | null;
  note_admin: unknown;
  note_primar: unknown;
  departament: string | null;
  tipuri_cereri?: { nume: string } | null;
  utilizatori?: { nume: string; prenume: string } | null;
}

export interface PrimarDashboardData {
  functionariCount: number;
  cereriTotal: number;
  cereriLuna: number;
  cereriRezolvate: number;
  satisfactiePct: number; // (rezolvate/total*100) or 0
  timpMediu: number; // days, avg from data_finalizare - created_at
  cereriByMonth: { luna: string; total: number }[];
  departamente: DepartamentRow[];
  proiecte: ProiectRow[];
}

export interface PrimarCereriData {
  escalatedQueue: CerereRow[]; // escaladata=true
  allCereri: CerereRow[];
  cereriByMonth: { luna: string; total: number }[];
}

export interface PrimarSetariData {
  displayName: string;
  titluOficial: string;
  email: string;
  mandatStart: string | null;
  mandatSfarsit: string | null;
  emailNotifications: boolean;
}

// ============================================================================
// Helpers
// ============================================================================

function aggregateByMonth(
  items: { created_at: string }[],
  monthsBack: number
): { luna: string; total: number }[] {
  const now = new Date();
  const monthKeys: string[] = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(d.toISOString().substring(0, 7));
  }

  const byMonth: Record<string, number> = {};
  items.forEach((item) => {
    const key = item.created_at.substring(0, 7);
    byMonth[key] = (byMonth[key] ?? 0) + 1;
  });

  return monthKeys.map((luna) => ({
    luna,
    total: byMonth[luna] ?? 0,
  }));
}

// ============================================================================
// Primar role guard
// ============================================================================

interface PrimarContext {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  primarieId: string;
}

async function getPrimarAuthContext(): Promise<PrimarContext | { error: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };
  const { supabase, userId, primarieId } = ctx;

  // Verify the user has role=primar for this primarie
  const { data: association } = await supabase
    .from("user_primarii")
    .select("rol")
    .eq("user_id", userId)
    .eq("primarie_id", primarieId)
    .eq("status", "approved")
    .single();

  if (!association || association.rol !== "primar") {
    return { error: "Acces interzis. Rolul primar este necesar." };
  }

  return { supabase, userId, primarieId };
}

// ============================================================================
// Read Action 1: getPrimarDashboardData
// ============================================================================

export async function getPrimarDashboardData(): Promise<{
  success: boolean;
  data?: PrimarDashboardData;
  error?: string;
}> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { success: false, error: ctx.error };
    const { supabase } = ctx;

    const [functionariResult, cereriResult, departamenteResult, proiecteResult] = await Promise.all(
      [
        supabase
          .from("user_primarii")
          .select("id", { count: "exact", head: true })
          .eq("rol", "functionar")
          .eq("status", "approved"),
        supabase
          .from("cereri")
          .select("id, status, created_at, data_finalizare")
          .is("deleted_at", null),
        supabase.from("departamente").select("*"),
        supabase
          .from("proiecte_municipale")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5),
      ]
    );

    const functionariCount = functionariResult.count ?? 0;
    const allCereri = cereriResult.data ?? [];
    const departamente = (departamenteResult.data ?? []) as DepartamentRow[];
    const proiecte = (proiecteResult.data ?? []) as ProiectRow[];

    // Compute KPIs from cereri array
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cereriTotal = allCereri.length;
    const cereriLuna = allCereri.filter(
      (c) => c.created_at && new Date(c.created_at) >= monthStart
    ).length;
    const cereriRezolvate = allCereri.filter(
      (c) => c.status === "aprobata" || c.status === "respinsa"
    ).length;
    const satisfactiePct = cereriTotal > 0 ? Math.round((cereriRezolvate / cereriTotal) * 100) : 0;

    // Compute average resolution time (days) for finalized cereri
    const finalizate = allCereri.filter((c) => c.data_finalizare && c.created_at);
    let timpMediu = 0;
    if (finalizate.length > 0) {
      const totalDays = finalizate.reduce((sum, c) => {
        const created = new Date(c.created_at!).getTime();
        const finished = new Date(c.data_finalizare!).getTime();
        const days = (finished - created) / (1000 * 60 * 60 * 24);
        return sum + (days > 0 ? days : 0);
      }, 0);
      timpMediu = Math.round((totalDays / finalizate.length) * 10) / 10;
    }

    // 6-month cereri trend
    const cereriByMonth = aggregateByMonth(
      allCereri
        .filter((c) => c.created_at != null)
        .map((c) => ({ created_at: c.created_at as string })),
      6
    );

    return {
      success: true,
      data: {
        functionariCount,
        cereriTotal,
        cereriLuna,
        cereriRezolvate,
        satisfactiePct,
        timpMediu,
        cereriByMonth,
        departamente,
        proiecte,
      },
    };
  } catch (error) {
    console.error("getPrimarDashboardData error:", error);
    return { success: false, error: "Eroare la încărcarea datelor dashboard." };
  }
}

// ============================================================================
// Read Action 2: getPrimarCereriData
// ============================================================================

// Raw cerere row shape from DB — includes columns from Phase 19 migration
// (escaladata, note_admin, prioritate not yet in generated types)
interface RawCerereRow {
  id: string;
  numar_inregistrare: string;
  status: string;
  created_at: string | null;
  data_finalizare: string | null;
  escaladata: boolean;
  prioritate: string | null;
  note_admin: unknown;
  note_primar: unknown;
  departament: string | null;
  tipuri_cereri: { nume: string } | null;
  utilizatori: { nume: string; prenume: string } | null;
}

function mapRawCerere(raw: RawCerereRow): CerereRow {
  return {
    id: raw.id,
    numar_inregistrare: raw.numar_inregistrare,
    status: raw.status,
    created_at: raw.created_at ?? "",
    data_finalizare: raw.data_finalizare,
    escaladata: raw.escaladata,
    prioritate: raw.prioritate,
    note_admin: raw.note_admin,
    note_primar: raw.note_primar,
    departament: raw.departament,
    tipuri_cereri: raw.tipuri_cereri,
    utilizatori: raw.utilizatori,
  };
}

const CERERE_SELECT =
  "id, numar_inregistrare, status, created_at, data_finalizare, escaladata, prioritate, note_admin, note_primar, departament, tipuri_cereri(nume), utilizatori(nume, prenume)";

export async function getPrimarCereriData(): Promise<{
  success: boolean;
  data?: PrimarCereriData;
  error?: string;
}> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { success: false, error: ctx.error };
    const { supabase } = ctx;

    // types:generate pending — escaladata/note_admin/prioritate not yet in DB schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anySupabase = supabase as any;

    const [escalatedResult, allCereriResult] = await Promise.all([
      anySupabase
        .from("cereri")
        .select(CERERE_SELECT)
        .eq("escaladata", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: false }) as Promise<{
        data: RawCerereRow[] | null;
        error: unknown;
      }>,
      anySupabase
        .from("cereri")
        .select(CERERE_SELECT)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(100) as Promise<{ data: RawCerereRow[] | null; error: unknown }>,
    ]);

    const escalatedQueue = (escalatedResult.data ?? []).map(mapRawCerere);
    const allCereri = (allCereriResult.data ?? []).map(mapRawCerere);
    const cereriByMonth = aggregateByMonth(
      allCereri.map((c) => ({ created_at: c.created_at })),
      6
    );

    return {
      success: true,
      data: { escalatedQueue, allCereri, cereriByMonth },
    };
  } catch (error) {
    console.error("getPrimarCereriData error:", error);
    return {
      success: false,
      error: "Eroare la încărcarea datelor. Încearcă să recarci pagina.",
    };
  }
}

// ============================================================================
// Read Action 3: getPrimarBugetData
// ============================================================================

export async function getPrimarBugetData(): Promise<{
  success: boolean;
  data?: { departamente: DepartamentRow[]; totalBuget: number; totalConsumat: number };
  error?: string;
}> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { success: false, error: ctx.error };
    const { supabase } = ctx;

    const [departamenteResult, proiecteResult] = await Promise.all([
      supabase.from("departamente").select("*").order("buget_alocat", { ascending: false }),
      supabase.from("proiecte_municipale").select("buget, buget_consumat"),
    ]);

    const departamente = (departamenteResult.data ?? []) as DepartamentRow[];
    const proiecte = (proiecteResult.data ?? []) as Pick<ProiectRow, "buget" | "buget_consumat">[];

    const totalDepartamenteBuget = departamente.reduce((sum, d) => sum + (d.buget_alocat ?? 0), 0);
    const totalProiecteBuget = proiecte.reduce((sum, p) => sum + (p.buget ?? 0), 0);
    const totalBuget = totalDepartamenteBuget + totalProiecteBuget;
    const totalConsumat = proiecte.reduce((sum, p) => sum + (p.buget_consumat ?? 0), 0);

    return {
      success: true,
      data: { departamente, totalBuget, totalConsumat },
    };
  } catch (error) {
    console.error("getPrimarBugetData error:", error);
    return {
      success: false,
      error: "Eroare la încărcarea datelor. Încearcă să recarci pagina.",
    };
  }
}

// ============================================================================
// Read Action 4: getPrimarProiecteData
// ============================================================================

export async function getPrimarProiecteData(): Promise<{
  success: boolean;
  data?: { proiecte: ProiectRow[] };
  error?: string;
}> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { success: false, error: ctx.error };
    const { supabase } = ctx;

    const { data } = await supabase
      .from("proiecte_municipale")
      .select("*")
      .order("created_at", { ascending: false });

    return {
      success: true,
      data: { proiecte: (data ?? []) as ProiectRow[] },
    };
  } catch (error) {
    console.error("getPrimarProiecteData error:", error);
    return {
      success: false,
      error: "Eroare la încărcarea datelor. Încearcă să recarci pagina.",
    };
  }
}

// ============================================================================
// Read Action 5: getPrimarAgendeData
// ============================================================================

export async function getPrimarAgendeData(
  year: number,
  month: number
): Promise<{
  success: boolean;
  data?: { events: AgendaEventRow[] };
  error?: string;
}> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { success: false, error: ctx.error };
    const { supabase, userId } = ctx;

    // Build date range for the given month (YYYY-MM-DD format)
    const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0]!;
    const lastDay = new Date(year, month, 0).toISOString().split("T")[0]!;

    const { data } = await supabase
      .from("agende_primar")
      .select("*")
      .eq("primar_id", userId)
      .gte("data_eveniment", firstDay)
      .lte("data_eveniment", lastDay)
      .order("data_eveniment", { ascending: true });

    return {
      success: true,
      data: { events: (data ?? []) as AgendaEventRow[] },
    };
  } catch (error) {
    console.error("getPrimarAgendeData error:", error);
    return {
      success: false,
      error: "Eroare la încărcarea datelor. Încearcă să recarci pagina.",
    };
  }
}

// ============================================================================
// Read Action 6: getPrimarRapoarteData
// ============================================================================

interface RapoarteCerereRaw {
  id: string;
  status: string;
  created_at: string | null;
}

export async function getPrimarRapoarteData(period: "luna" | "trimestru" | "semestru"): Promise<{
  success: boolean;
  data?: {
    cereriByMonth: { luna: string; total: number; rezolvate: number }[];
    departamente: DepartamentRow[];
  };
  error?: string;
}> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { success: false, error: ctx.error };
    const { supabase } = ctx;

    // Compute date range
    const monthsBack = period === "luna" ? 1 : period === "trimestru" ? 3 : 6;
    const now = new Date();
    const rangeStart = new Date(now.getFullYear(), now.getMonth() - (monthsBack - 1), 1);
    const rangeStartStr = rangeStart.toISOString();

    const [cereriResult, departamenteResult] = await Promise.all([
      supabase
        .from("cereri")
        .select("id, status, created_at")
        .gte("created_at", rangeStartStr)
        .is("deleted_at", null),
      supabase.from("departamente").select("*"),
    ]);

    const allCereri = (cereriResult.data ?? []) as RapoarteCerereRaw[];
    const departamente = (departamenteResult.data ?? []) as DepartamentRow[];

    // Build monthly breakdown with rezolvate count
    const monthKeys: string[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthKeys.push(d.toISOString().substring(0, 7));
    }

    const totalByMonth: Record<string, number> = {};
    const rezolvateByMonth: Record<string, number> = {};
    monthKeys.forEach((k) => {
      totalByMonth[k] = 0;
      rezolvateByMonth[k] = 0;
    });

    allCereri.forEach((c) => {
      if (!c.created_at) return;
      const key = c.created_at.substring(0, 7);
      if (key in totalByMonth) {
        totalByMonth[key] = (totalByMonth[key] ?? 0) + 1;
        if (c.status === "aprobata" || c.status === "respinsa") {
          rezolvateByMonth[key] = (rezolvateByMonth[key] ?? 0) + 1;
        }
      }
    });

    const cereriByMonth = monthKeys.map((luna) => ({
      luna,
      total: totalByMonth[luna] ?? 0,
      rezolvate: rezolvateByMonth[luna] ?? 0,
    }));

    return {
      success: true,
      data: { cereriByMonth, departamente },
    };
  } catch (error) {
    console.error("getPrimarRapoarteData error:", error);
    return {
      success: false,
      error: "Eroare la încărcarea datelor. Încearcă să recarci pagina.",
    };
  }
}

// ============================================================================
// Read Action 7: getPrimarSetariData
// ============================================================================

export async function getPrimarSetariData(): Promise<{
  success: boolean;
  data?: PrimarSetariData;
  error?: string;
}> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { success: false, error: ctx.error };
    const { supabase, userId, primarieId } = ctx;

    const [utilizatorResult, authUserResult, mandatResult] = await Promise.all([
      supabase
        .from("utilizatori")
        .select("nume, prenume, notificari_email, email")
        .eq("id", userId)
        .single(),
      supabase.auth.getUser(),
      supabase
        .from("user_primarii")
        .select("mandat_start, mandat_sfarsit")
        .eq("user_id", userId)
        .eq("primarie_id", primarieId)
        .eq("status", "approved")
        .maybeSingle(),
    ]);

    const utilizator = utilizatorResult.data;
    const authUser = authUserResult.data.user;
    const mandat = mandatResult.data;

    const displayName = utilizator
      ? `${utilizator.prenume ?? ""} ${utilizator.nume ?? ""}`.trim()
      : "";

    return {
      success: true,
      data: {
        displayName,
        titluOficial: "Primar",
        email: authUser?.email ?? utilizator?.email ?? "",
        mandatStart: mandat?.mandat_start ?? null,
        mandatSfarsit: mandat?.mandat_sfarsit ?? null,
        emailNotifications: utilizator?.notificari_email ?? false,
      },
    };
  } catch (error) {
    console.error("getPrimarSetariData error:", error);
    return {
      success: false,
      error: "Eroare la încărcarea datelor. Încearcă să recarci pagina.",
    };
  }
}

// ============================================================================
// Write Action 1: approveCerere
// ============================================================================

export async function approveCerere(cerereId: string): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase } = ctx;

    // types:generate pending — escaladata not yet in DB schema
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anySupabase = supabase as any;

    const { error } = (await anySupabase
      .from("cereri")
      .update({
        status: "aprobata",
        escaladata: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cerereId)) as { error: { message: string } | null };

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("approveCerere error:", error);
    return { error: "Eroare la aprobarea cererii." };
  }
}

// ============================================================================
// Write Action 2: rejectCerere
// ============================================================================

export async function rejectCerere(cerereId: string, motiv?: string): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase, userId } = ctx;

    // types:generate pending — escaladata not yet in DB schema (note_primar now typed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anySupabase = supabase as any;

    let updatedNotes: unknown[] | undefined;
    if (motiv) {
      // Fetch current note_primar to append rejection motiv (note_primar is now in generated types)
      const { data: current } = await supabase
        .from("cereri")
        .select("note_primar")
        .eq("id", cerereId)
        .single();

      const existing = Array.isArray(current?.note_primar) ? current.note_primar : [];
      updatedNotes = [
        ...existing,
        { text: motiv, timestamp: new Date().toISOString(), actor: userId },
      ];
    }

    const updateData: Record<string, unknown> = {
      status: "respinsa",
      escaladata: false,
      updated_at: new Date().toISOString(),
    };
    if (updatedNotes !== undefined) {
      updateData.note_primar = updatedNotes;
    }

    const { error } = (await anySupabase.from("cereri").update(updateData).eq("id", cerereId)) as {
      error: { message: string } | null;
    };

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("rejectCerere error:", error);
    return { error: "Eroare la respingerea cererii." };
  }
}

// ============================================================================
// Write Action 3: addNotaPrimar
// ============================================================================

export async function addNotaPrimar(cerereId: string, text: string): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase, userId } = ctx;

    const { data: current } = await supabase
      .from("cereri")
      .select("note_primar")
      .eq("id", cerereId)
      .single();

    const existing = Array.isArray(current?.note_primar) ? current.note_primar : [];
    const updatedNotes = [
      ...existing,
      { text, timestamp: new Date().toISOString(), actor: userId },
    ];

    const { error } = await supabase
      .from("cereri")
      .update({ note_primar: updatedNotes })
      .eq("id", cerereId);

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("addNotaPrimar error:", error);
    return { error: "Eroare la adăugarea notei." };
  }
}

// ============================================================================
// Write Action 4: createProiect
// ============================================================================

export async function createProiect(data: {
  nume: string;
  categorie?: string;
  status: ProiectRow["status"];
  progres_pct: number;
  buget: number;
  buget_consumat: number;
  deadline?: string;
  responsabil?: string;
}): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase, primarieId } = ctx;

    const { error } = await supabase
      .from("proiecte_municipale")
      .insert({ ...data, primarie_id: primarieId });

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("createProiect error:", error);
    return { error: "Eroare la crearea proiectului." };
  }
}

// ============================================================================
// Write Action 5: updateProiect
// ============================================================================

export async function updateProiect(
  id: string,
  data: Partial<Omit<ProiectRow, "id" | "primarie_id" | "created_at">>
): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase } = ctx;

    const { error } = await supabase
      .from("proiecte_municipale")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("updateProiect error:", error);
    return { error: "Eroare la actualizarea proiectului." };
  }
}

// ============================================================================
// Write Action 6: deleteProiect
// ============================================================================

export async function deleteProiect(id: string): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase } = ctx;

    const { error } = await supabase.from("proiecte_municipale").delete().eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("deleteProiect error:", error);
    return { error: "Eroare la ștergerea proiectului." };
  }
}

// ============================================================================
// Write Action 7: createAgendaEvent
// ============================================================================

export async function createAgendaEvent(data: {
  titlu: string;
  data_eveniment: string;
  ora_start?: string;
  ora_sfarsit?: string;
  tip: AgendaEventRow["tip"];
  descriere?: string;
}): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase, userId, primarieId } = ctx;

    const { error } = await supabase
      .from("agende_primar")
      .insert({ ...data, primarie_id: primarieId, primar_id: userId });

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("createAgendaEvent error:", error);
    return { error: "Eroare la crearea evenimentului." };
  }
}

// ============================================================================
// Write Action 8: updateAgendaEvent
// ============================================================================

export async function updateAgendaEvent(
  id: string,
  data: Partial<Omit<AgendaEventRow, "id" | "primarie_id" | "primar_id" | "created_at">>
): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase, userId } = ctx;

    const { error } = await supabase
      .from("agende_primar")
      .update(data)
      .eq("id", id)
      .eq("primar_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("updateAgendaEvent error:", error);
    return { error: "Eroare la actualizarea evenimentului." };
  }
}

// ============================================================================
// Write Action 9: deleteAgendaEvent
// ============================================================================

export async function deleteAgendaEvent(id: string): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase, userId } = ctx;

    const { error } = await supabase
      .from("agende_primar")
      .delete()
      .eq("id", id)
      .eq("primar_id", userId);

    if (error) return { error: error.message };

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("deleteAgendaEvent error:", error);
    return { error: "Eroare la ștergerea evenimentului." };
  }
}

// ============================================================================
// Write Action 10: updatePrimarSetari
// ============================================================================

export async function updatePrimarSetari(data: {
  displayName?: string;
  mandatStart?: string;
  mandatSfarsit?: string;
  emailNotifications?: boolean;
}): Promise<{ error?: string }> {
  try {
    const ctx = await getPrimarAuthContext();
    if ("error" in ctx) return { error: ctx.error };
    const { supabase, userId, primarieId } = ctx;

    const errors: ({ message: string } | null)[] = [];

    // Update displayName → split to prenume + nume on utilizatori
    if (data.displayName !== undefined) {
      const parts = data.displayName.trim().split(" ");
      const prenume = parts[0] ?? "";
      const nome = parts.slice(1).join(" ") || prenume; // fallback if single word
      const { error } = await supabase
        .from("utilizatori")
        .update({ prenume, nume: nome })
        .eq("id", userId);
      if (error) errors.push(error);
    }

    // Update emailNotifications on utilizatori
    if (data.emailNotifications !== undefined) {
      const { error } = await supabase
        .from("utilizatori")
        .update({ notificari_email: data.emailNotifications })
        .eq("id", userId);
      if (error) errors.push(error);
    }

    // Update mandat dates on user_primarii (mandat_start/mandat_sfarsit now in generated types)
    if (data.mandatStart !== undefined || data.mandatSfarsit !== undefined) {
      const mandatUpdate: { mandat_start?: string; mandat_sfarsit?: string } = {};
      if (data.mandatStart !== undefined) mandatUpdate.mandat_start = data.mandatStart;
      if (data.mandatSfarsit !== undefined) mandatUpdate.mandat_sfarsit = data.mandatSfarsit;

      const { error } = await supabase
        .from("user_primarii")
        .update(mandatUpdate)
        .eq("user_id", userId)
        .eq("primarie_id", primarieId)
        .eq("status", "approved");
      if (error) errors.push(error);
    }

    if (errors.length > 0) {
      return { error: errors[0]?.message ?? "Eroare la salvarea setărilor." };
    }

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("updatePrimarSetari error:", error);
    return { error: "Eroare la salvarea setărilor." };
  }
}
