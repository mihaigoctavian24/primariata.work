"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import {
  canCancelCerere,
  cancelCerereSchema,
  CerereStatus,
  type CerereStatusType,
} from "@/lib/validations/cereri";
import type { Cerere } from "@/types/api";
import type { CerereIstoricEntry } from "@/hooks/use-cerere-timeline";

/**
 * Standard result type for detail Server Actions.
 */
interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Result type for getCerereDetails.
 */
type CerereDetailsResult = { success: true; data: Cerere } | { success: false; error: string };

/**
 * Result type for getCerereDocuments.
 */
type CerereDocumentsResult = { success: true; data: unknown[] } | { success: false; error: string };

/**
 * Result type for getCerereTimeline.
 */
type CerereTimelineResult =
  | { success: true; data: CerereIstoricEntry[] }
  | { success: false; error: string };

/**
 * Fetch cerere details by ID with tip_cerere join.
 *
 * Uses createClient() from server.ts which inherits x-primarie-id
 * from the page request context (set by middleware on /app/* paths).
 * This solves the RLS context issue that API routes under /api/* have
 * (they never receive x-primarie-id from middleware).
 *
 * @param cerereId - The cerere UUID
 * @returns CerereDetailsResult with cerere data or error
 */
export async function getCerereDetails(cerereId: string): Promise<CerereDetailsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    const { data: cerere, error } = await supabase
      .from("cereri")
      .select(
        `
        id,
        primarie_id,
        tip_cerere_id,
        solicitant_id,
        preluat_de_id,
        numar_inregistrare,
        date_formular,
        observatii_solicitant,
        status,
        raspuns,
        motiv_respingere,
        necesita_plata,
        valoare_plata,
        plata_efectuata,
        plata_efectuata_la,
        data_termen,
        data_finalizare,
        created_at,
        updated_at,
        tip_cerere:tipuri_cereri(
          id,
          cod,
          nume,
          descriere,
          campuri_formular,
          documente_necesare,
          termen_legal_zile,
          necesita_taxa,
          valoare_taxa,
          departament_responsabil
        )
      `
      )
      .eq("id", cerereId)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return { success: false, error: "Cererea nu a fost gasita" };
      }

      logger.error("Database error fetching cerere details:", error);
      return { success: false, error: "Eroare la incarcarea cererii" };
    }

    return { success: true, data: cerere as Cerere };
  } catch (error) {
    logger.error("Unexpected error in getCerereDetails:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

/**
 * Fetch documents for a cerere.
 *
 * Uses createClient() which inherits x-primarie-id from the page
 * request context. The RLS check on cereri table validates visibility
 * before returning documents.
 *
 * @param cerereId - The cerere UUID
 * @returns CerereDocumentsResult with documents array or error
 */
export async function getCerereDocuments(cerereId: string): Promise<CerereDocumentsResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // Verify cerere exists and is visible to user (RLS handles visibility)
    const { data: cerere, error: cerereError } = await supabase
      .from("cereri")
      .select("id")
      .eq("id", cerereId)
      .is("deleted_at", null)
      .single();

    if (cerereError || !cerere) {
      return { success: false, error: "Cererea nu a fost gasita" };
    }

    // Fetch documents
    const { data: documents, error: documentsError } = await supabase
      .from("documente")
      .select("*")
      .eq("cerere_id", cerereId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (documentsError) {
      logger.error("Database error fetching documents:", documentsError);
      return { success: false, error: "Eroare la incarcarea documentelor" };
    }

    return { success: true, data: documents || [] };
  } catch (error) {
    logger.error("Unexpected error in getCerereDocuments:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

/**
 * Cancel a cerere.
 *
 * Validates the motiv with cancelCerereSchema, checks cerere ownership
 * (solicitant_id = user.id), checks canCancelCerere(status), then
 * updates status to ANULATA.
 *
 * @param cerereId - The cerere UUID
 * @param motiv - The cancellation reason (min 10 chars)
 * @returns ActionResult with success/error
 */
export async function cancelCerere(cerereId: string, motiv: string): Promise<ActionResult> {
  try {
    // Validate motiv
    const parseResult = cancelCerereSchema.safeParse({ motiv_anulare: motiv });
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error.issues[0]?.message || "Motivul anularii este invalid",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // Fetch cerere to check ownership and status
    const { data: cerere, error: fetchError } = await supabase
      .from("cereri")
      .select("id, status, solicitant_id")
      .eq("id", cerereId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !cerere) {
      return { success: false, error: "Cererea nu a fost gasita" };
    }

    // Verify ownership
    if (cerere.solicitant_id !== user.id) {
      return { success: false, error: "Nu aveti permisiunea de a anula aceasta cerere" };
    }

    // Check if cerere can be cancelled based on status
    if (!canCancelCerere(cerere.status as CerereStatusType)) {
      return { success: false, error: "Cererea nu poate fi anulata in starea curenta" };
    }

    // Update cerere to cancelled status
    const { error: updateError } = await supabase
      .from("cereri")
      .update({
        status: CerereStatus.ANULATA,
        motiv_respingere: parseResult.data.motiv_anulare,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cerereId);

    if (updateError) {
      logger.error("Database error cancelling cerere:", updateError);
      return { success: false, error: "Eroare la anularea cererii" };
    }

    logger.info(`Cerere ${cerereId} cancelled by ${user.id}`);
    revalidatePath("/app");
    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in cancelCerere:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

/**
 * Fetch the timeline (cerere_istoric) for a cerere.
 *
 * Uses createClient() from server.ts which inherits x-primarie-id
 * from the page request context (set by middleware). This ensures
 * RLS policies receive the correct primarie context, unlike direct
 * browser-side Supabase calls which bypass middleware.
 *
 * @param cerereId - The cerere UUID
 * @param isStaff - Whether the user is staff (sees all entries including internal notes)
 * @returns CerereTimelineResult with timeline entries or error
 */
export async function getCerereTimeline(
  cerereId: string,
  isStaff: boolean
): Promise<CerereTimelineResult> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // cerere_istoric is a new table not yet in generated database types.
    // Use type assertion to access it via the Supabase client.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;

    let query = client
      .from("cerere_istoric")
      .select(
        `
        id,
        cerere_id,
        tip,
        old_status,
        new_status,
        motiv,
        documente_solicitate,
        actor_id,
        vizibil_cetatean,
        created_at
      `
      )
      .eq("cerere_id", cerereId)
      .order("created_at", { ascending: true });

    // Citizens only see public entries (RLS already filters this,
    // but adding explicit filter for defense-in-depth)
    if (!isStaff) {
      query = query.eq("vizibil_cetatean", true);
    }

    const { data, error } = await query;

    if (error) {
      logger.error("Database error fetching cerere timeline:", error);
      return { success: false, error: "Eroare la incarcarea istoricului" };
    }

    // Hydrate actor names from utilizatori table
    // (no direct FK from cerere_istoric to utilizatori — both reference auth.users)
    const entries = (data ?? []) as CerereIstoricEntry[];
    const actorIds = [...new Set(entries.map((e) => e.actor_id).filter(Boolean))];

    if (actorIds.length > 0) {
      const { data: actors } = await supabase
        .from("utilizatori")
        .select("id, prenume, nume")
        .in("id", actorIds);

      if (actors) {
        const actorMap = new Map(actors.map((a) => [a.id, a]));
        for (const entry of entries) {
          const actor = actorMap.get(entry.actor_id);
          if (actor) {
            entry.actor = { prenume: actor.prenume, nume: actor.nume };
          }
        }
      }
    }

    return { success: true, data: entries };
  } catch (error) {
    logger.error("Unexpected error in getCerereTimeline:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}
