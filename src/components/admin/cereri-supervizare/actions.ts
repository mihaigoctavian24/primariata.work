"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/get-auth-context";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

interface NoteAdminEntry {
  text: string;
  timestamp: string;
  actor: string;
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Update a cerere's status.
 * Validates against known DB enum values. Revalidates layout on success.
 */
export async function updateCerereStatus(
  cerereId: string,
  newStatus: string
): Promise<{ error?: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const validStatuses = [
    "depusa",
    "in_verificare",
    "info_suplimentara",
    "in_procesare",
    "aprobata",
    "respinsa",
  ];
  if (!validStatuses.includes(newStatus)) {
    return { error: "Status invalid" };
  }

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("cereri")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", cerereId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/**
 * Append an admin note to cereri.note_admin (JSONB array).
 * Reads existing notes first, appends new entry, then updates.
 */
export async function addCerereNote(cerereId: string, note: string): Promise<{ error?: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  if (!note.trim()) return { error: "Nota nu poate fi goala" };

  const supabase = createServiceRoleClient();

  const { data: rawData, error: readError } = await supabase
    .from("cereri")
    .select("*")
    .eq("id", cerereId)
    .single();

  if (readError || !rawData) {
    return { error: readError?.message ?? "Cererea nu a fost gasita" };
  }

  const rowRecord = rawData as unknown as Record<string, unknown>;
  const existingNotes: NoteAdminEntry[] = Array.isArray(rowRecord["note_admin"])
    ? (rowRecord["note_admin"] as NoteAdminEntry[])
    : [];

  const newEntry: NoteAdminEntry = {
    text: note.trim(),
    timestamp: new Date().toISOString(),
    actor: "Admin",
  };

  const { error: updateError } = await supabase
    .from("cereri")
    .update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      note_admin: [...existingNotes, newEntry] as any,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cerereId);

  if (updateError) return { error: updateError.message };

  revalidatePath("/", "layout");
  return {};
}

/**
 * Reassign a cerere to a different functionar (preluat_de_id).
 */
export async function reassignCerere(
  cerereId: string,
  functionarId: string
): Promise<{ error?: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("cereri")
    .update({
      preluat_de_id: functionarId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cerereId);

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return {};
}

/**
 * Escalate a cerere to Primar — sets escaladata=true and prioritate=urgenta.
 * Uses note parameter to add an audit entry.
 */
export async function escalateCerere(
  cerereId: string,
  note: string
): Promise<{ error?: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const supabase = createServiceRoleClient();

  // Append escalation note to note_admin
  const { data: rawData, error: readError } = await supabase
    .from("cereri")
    .select("*")
    .eq("id", cerereId)
    .single();

  if (readError || !rawData) return { error: readError?.message ?? "Cerere negăsită" };

  const rowRecord = rawData as unknown as Record<string, unknown>;
  const existingNotes: NoteAdminEntry[] = Array.isArray(rowRecord["note_admin"])
    ? (rowRecord["note_admin"] as NoteAdminEntry[])
    : [];

  const newEntry: NoteAdminEntry = {
    text: `[ESCALADARE] ${note.trim() || "Escaladată la Primar de admin"}`,
    timestamp: new Date().toISOString(),
    actor: "Admin",
  };

  const { error } = await supabase
    .from("cereri")
    .update({
      escaladata: true,
      prioritate: "urgenta",
      note_admin: [...existingNotes, newEntry] as unknown as NoteAdminEntry[],
      updated_at: new Date().toISOString(),
    } as Record<string, unknown>)
    .eq("id", cerereId);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

/**
 * Change cerere prioritate.
 */
export async function changePriorityCerere(
  cerereId: string,
  prioritate: "urgenta" | "ridicata" | "medie" | "scazuta"
): Promise<{ error?: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("cereri")
    .update({ prioritate, updated_at: new Date().toISOString() } as Record<string, unknown>)
    .eq("id", cerereId);

  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}
