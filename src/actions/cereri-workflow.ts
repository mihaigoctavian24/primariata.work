"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { canTransition, requiresReason } from "@/lib/cereri/transitions";
import type { UserRole } from "@/lib/cereri/transitions";
import type { CerereStatusType } from "@/lib/validations/cereri";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Standard result type for workflow Server Actions.
 * Follows the pattern established in admin-registration.ts.
 */
interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Helper to insert into cerere_istoric using an untyped query.
 * cerere_istoric is a new table not yet in generated database types.
 * Uses .from() with type assertion to bypass strict type checking.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function cerereIstoricFrom(client: SupabaseClient<any>): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client as any).from("cerere_istoric");
}

/**
 * Transition a cerere to a new status with role-based validation.
 *
 * Pre-validates the transition in TypeScript (defense-in-depth),
 * then executes the update which triggers the DB-level enforcement.
 * Optionally records a reason/motiv on the cerere_istoric entry.
 *
 * @param cerereId - The cerere UUID
 * @param newStatus - The target status
 * @param motiv - Optional reason for the transition
 * @returns ActionResult with success/error
 */
export async function transitionCerereStatus(
  cerereId: string,
  newStatus: string,
  motiv?: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Autentificare necesara" };

    // Fetch cerere with current status
    const { data: cerere, error: fetchError } = await supabase
      .from("cereri")
      .select("id, status, primarie_id, solicitant_id")
      .eq("id", cerereId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !cerere) {
      return { success: false, error: "Cererea nu a fost gasita" };
    }

    // Determine effective role
    let effectiveRole: UserRole = "cetatean";
    if (user.id === cerere.solicitant_id) {
      effectiveRole = "cetatean";
    } else {
      const { data: userPrimarie } = await supabase
        .from("user_primarii")
        .select("rol")
        .eq("user_id", user.id)
        .eq("primarie_id", cerere.primarie_id!)
        .eq("status", "approved")
        .single();

      effectiveRole = (userPrimarie?.rol as UserRole) ?? "cetatean";
    }

    // Pre-validate transition in TypeScript
    if (
      !canTransition(
        cerere.status as CerereStatusType,
        newStatus as CerereStatusType,
        effectiveRole
      )
    ) {
      return { success: false, error: "Tranzitie de status invalida" };
    }

    // Validate reason required
    if (requiresReason(newStatus as CerereStatusType) && !motiv?.trim()) {
      return { success: false, error: "Motivul este obligatoriu pentru aceasta tranzitie" };
    }

    // Execute the update (DB trigger validates + auto-records in cerere_istoric)
    const { error: updateError } = await supabase
      .from("cereri")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", cerereId);

    if (updateError) {
      logger.error("Failed to transition cerere status:", updateError);
      return { success: false, error: updateError.message };
    }

    // If motiv provided, update the cerere_istoric entry created by the trigger
    if (motiv?.trim()) {
      const serviceClient = createServiceRoleClient();
      await cerereIstoricFrom(serviceClient)
        .update({ motiv: motiv.trim() })
        .eq("cerere_id", cerereId)
        .eq("new_status", newStatus)
        .eq("actor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    logger.info(
      `Cerere ${cerereId} transitioned to ${newStatus} by ${user.id} (role: ${effectiveRole})`
    );
    revalidatePath("/app");
    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in transitionCerereStatus:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

/**
 * Add an internal note to a cerere.
 * Internal notes are visible only to staff (vizibil_cetatean = false).
 *
 * @param cerereId - The cerere UUID
 * @param content - The note content
 * @returns ActionResult with success/error
 */
export async function addInternalNote(cerereId: string, content: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Autentificare necesara" };

    // Fetch cerere to get primarie_id
    const { data: cerere, error: fetchError } = await supabase
      .from("cereri")
      .select("id, primarie_id")
      .eq("id", cerereId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !cerere) {
      return { success: false, error: "Cererea nu a fost gasita" };
    }

    // Verify user is staff
    const { data: userPrimarie } = await supabase
      .from("user_primarii")
      .select("rol")
      .eq("user_id", user.id)
      .eq("primarie_id", cerere.primarie_id!)
      .eq("status", "approved")
      .single();

    if (!userPrimarie || !["functionar", "admin", "primar"].includes(userPrimarie.rol)) {
      return { success: false, error: "Doar personalul primariei poate adauga note interne" };
    }

    // Insert internal note into cerere_istoric
    const serviceClient = createServiceRoleClient();
    const { error: insertError } = await cerereIstoricFrom(serviceClient).insert({
      cerere_id: cerereId,
      primarie_id: cerere.primarie_id,
      tip: "nota_interna",
      motiv: content.trim(),
      actor_id: user.id,
      vizibil_cetatean: false,
    });

    if (insertError) {
      logger.error("Failed to add internal note:", insertError);
      return { success: false, error: "Eroare la adaugarea notei" };
    }

    logger.info(`Internal note added to cerere ${cerereId} by ${user.id}`);
    revalidatePath("/app");
    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in addInternalNote:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

/**
 * Request additional documents from a citizen.
 * Transitions the cerere to info_suplimentare and records document request details.
 *
 * @param cerereId - The cerere UUID
 * @param documents - Array of requested documents with tip, denumire, and optional motiv
 * @param nota - Optional note explaining the request
 * @returns ActionResult with success/error
 */
export async function requestDocuments(
  cerereId: string,
  documents: Array<{ tip: string; denumire: string; motiv?: string }>,
  nota?: string
): Promise<ActionResult> {
  try {
    // First, transition to info_suplimentare
    const transitionResult = await transitionCerereStatus(
      cerereId,
      "info_suplimentare",
      nota || "Sunt necesare documente suplimentare"
    );

    if (!transitionResult.success) {
      return transitionResult;
    }

    // Then, record the document request details
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Autentificare necesara" };

    // Fetch cerere for primarie_id
    const { data: cerere } = await supabase
      .from("cereri")
      .select("primarie_id")
      .eq("id", cerereId)
      .single();

    if (!cerere) {
      return { success: false, error: "Cererea nu a fost gasita" };
    }

    // Insert document request entry
    const serviceClient = createServiceRoleClient();
    const { error: insertError } = await cerereIstoricFrom(serviceClient).insert({
      cerere_id: cerereId,
      primarie_id: cerere.primarie_id,
      tip: "document_request",
      documente_solicitate: documents,
      motiv: nota?.trim() || null,
      actor_id: user.id,
      vizibil_cetatean: true,
    });

    if (insertError) {
      logger.error("Failed to record document request:", insertError);
      // Don't fail -- the transition already happened
    }

    logger.info(`Document request created for cerere ${cerereId} by ${user.id}`);
    revalidatePath("/app");
    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in requestDocuments:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

/**
 * Resubmit a cerere after providing additional info.
 * Only the cerere owner (citizen) can resubmit from info_suplimentare -> in_verificare.
 *
 * @param cerereId - The cerere UUID
 * @param observatii - Optional observations about the resubmission
 * @returns ActionResult with success/error
 */
export async function resubmitCerere(cerereId: string, observatii?: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Autentificare necesara" };

    // Fetch cerere
    const { data: cerere, error: fetchError } = await supabase
      .from("cereri")
      .select("id, status, solicitant_id")
      .eq("id", cerereId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !cerere) {
      return { success: false, error: "Cererea nu a fost gasita" };
    }

    // Verify user is the owner
    if (cerere.solicitant_id !== user.id) {
      return { success: false, error: "Doar solicitantul poate retrimite cererea" };
    }

    // Verify current status
    if (cerere.status !== "info_suplimentare") {
      return { success: false, error: "Cererea nu este in starea de informatii suplimentare" };
    }

    // Transition back to in_verificare
    const { error: updateError } = await supabase
      .from("cereri")
      .update({ status: "in_verificare", updated_at: new Date().toISOString() })
      .eq("id", cerereId);

    if (updateError) {
      logger.error("Failed to resubmit cerere:", updateError);
      return { success: false, error: updateError.message };
    }

    // If observatii provided, update the cerere_istoric entry
    if (observatii?.trim()) {
      const serviceClient = createServiceRoleClient();
      await cerereIstoricFrom(serviceClient)
        .update({ motiv: observatii.trim() })
        .eq("cerere_id", cerereId)
        .eq("new_status", "in_verificare")
        .eq("actor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
    }

    logger.info(`Cerere ${cerereId} resubmitted by ${user.id}`);
    revalidatePath("/app");
    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in resubmitCerere:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}
