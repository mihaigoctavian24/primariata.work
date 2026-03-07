"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/get-auth-context";
import { revalidatePath } from "next/cache";

// ============================================================================
// Types
// ============================================================================

export interface ActionResult {
  success: boolean;
  error?: string;
}

interface NoteAdmin {
  text: string;
  timestamp: string;
  actor: string;
}

// ============================================================================
// Server Actions
// ============================================================================

/**
 * Update a cerere's status.
 * Uses service role client to bypass RLS for cross-user admin operations.
 */
export async function updateCerereStatus(
  cerereId: string,
  newDbStatus: string
): Promise<ActionResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const supabase = createServiceRoleClient();

  const validStatuses = [
    "depusa",
    "in_verificare",
    "info_suplimentara",
    "in_procesare",
    "aprobata",
    "respinsa",
  ];
  if (!validStatuses.includes(newDbStatus)) {
    return { success: false, error: "Status invalid" };
  }

  const { error } = await supabase
    .from("cereri")
    .update({ status: newDbStatus, updated_at: new Date().toISOString() })
    .eq("id", cerereId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cereri");
  return { success: true };
}

/**
 * Set the priority on a cerere.
 * Validates priority value before updating.
 */
export async function setCererePrioritate(
  cerereId: string,
  prioritate: string
): Promise<ActionResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const validPrioritati = ["urgenta", "ridicata", "medie", "scazuta"];
  if (!validPrioritati.includes(prioritate)) {
    return { success: false, error: "Prioritate invalida" };
  }

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("cereri")
    .update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prioritate: prioritate as any,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cerereId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cereri");
  return { success: true };
}

/**
 * Append an admin note to a cerere's note_admin JSONB array.
 */
export async function addCerereNota(
  cerereId: string,
  text: string,
  actorNume: string
): Promise<ActionResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  if (!text.trim()) {
    return { success: false, error: "Nota nu poate fi goala" };
  }

  const supabase = createServiceRoleClient();

  // Read current note_admin array via raw select (column added by Wave 0 migration,
  // not yet reflected in generated DB types — using 'select *' and casting)
  const { data: rawData, error: rawError } = await supabase
    .from("cereri")
    .select("*")
    .eq("id", cerereId)
    .single();

  if (rawError || !rawData) {
    return { success: false, error: rawError?.message ?? "Cererea nu a fost gasita" };
  }

  const rowAsRecord = rawData as unknown as Record<string, unknown>;
  const existingNotes: NoteAdmin[] = Array.isArray(rowAsRecord["note_admin"])
    ? (rowAsRecord["note_admin"] as NoteAdmin[])
    : [];

  const newNote: NoteAdmin = {
    text: text.trim(),
    timestamp: new Date().toISOString(),
    actor: actorNume,
  };

  const updatedNotes = [...existingNotes, newNote];

  const { error: updateError } = await supabase
    .from("cereri")
    .update({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      note_admin: updatedNotes as any,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cerereId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath("/admin/cereri");
  return { success: true };
}

/**
 * Reassign a cerere to a different functionar.
 */
export async function reassignCerere(
  cerereId: string,
  newFunctionarId: string
): Promise<ActionResult> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { success: false, error: ctx.error };

  const supabase = createServiceRoleClient();

  const { error } = await supabase
    .from("cereri")
    .update({
      preluat_de_id: newFunctionarId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cerereId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/cereri");
  return { success: true };
}
