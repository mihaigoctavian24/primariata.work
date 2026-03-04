"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

interface ExportResult {
  success: true;
  data: string;
  filename: string;
}

interface ErrorResult {
  success: false;
  error: string;
}

interface SuccessResult {
  success: true;
}

/**
 * Export all user personal data as JSON (GDPR DSAR - Data Subject Access Request).
 * Queries profile, cereri with history, plati, documente (metadata only), and notificari.
 * RLS handles filtering automatically.
 */
export async function exportUserData(): Promise<ExportResult | ErrorResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Nu esti autentificat" };
    }

    // cerere_istoric is not in generated types -- query separately with untyped client
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const untypedFrom = (table: string) => (supabase as any).from(table);

    const [
      profileResult,
      cereriResult,
      cereriIstoricResult,
      platiResult,
      documenteResult,
      notificariResult,
    ] = await Promise.all([
      supabase.from("utilizatori").select("*").eq("id", user.id).single(),
      supabase.from("cereri").select("*").order("created_at", { ascending: false }),
      untypedFrom("cerere_istoric")
        .select("*")
        .order("created_at", { ascending: false }) as Promise<{ data: unknown[] | null }>,
      supabase.from("plati").select("*").order("created_at", { ascending: false }),
      supabase
        .from("documente")
        .select("id, nume_fisier, tip_document, created_at, cerere_id")
        .order("created_at", { ascending: false }),
      supabase.from("notificari").select("*").order("created_at", { ascending: false }),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profil: profileResult.data,
      cereri: cereriResult.data ?? [],
      cereri_istoric: cereriIstoricResult.data ?? [],
      plati: platiResult.data ?? [],
      documente: documenteResult.data ?? [],
      notificari: notificariResult.data ?? [],
    };

    const data = JSON.stringify(exportData, null, 2);
    const userIdPrefix = user.id.substring(0, 8);
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `primariata-export-${userIdPrefix}-${dateStr}.json`;

    return { success: true, data, filename };
  } catch (error) {
    logger.error("GDPR export failed:", error);
    return { success: false, error: "Exportul datelor a esuat. Incearca din nou." };
  }
}

/**
 * Request account deletion with password confirmation.
 * Bans the auth user to prevent login during 30-day grace period.
 */
export async function requestAccountDeletion(
  password: string
): Promise<SuccessResult | ErrorResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Nu esti autentificat" };
    }

    // Verify password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password,
    });

    if (signInError) {
      return { success: false, error: "Parola incorecta" };
    }

    const serviceClient = createServiceRoleClient();

    // Update profile: mark deletion requested
    // deletion_requested_at and status columns added for GDPR -- not yet in generated types
    const { error: updateError } = await serviceClient
      .from("utilizatori")
      .update({
        deletion_requested_at: new Date().toISOString(),
        status: "pending_deletion",
      } as Record<string, unknown>)
      .eq("id", user.id);

    if (updateError) {
      logger.error("Failed to mark account for deletion:", updateError);
      return { success: false, error: "Nu s-a putut procesa cererea de stergere" };
    }

    // Ban user to prevent login during grace period
    const { error: banError } = await serviceClient.auth.admin.updateUserById(user.id, {
      ban_duration: "876000h",
    });

    if (banError) {
      logger.error("Failed to ban user during deletion:", banError);
    }

    // Sign out current session
    await supabase.auth.signOut();

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    logger.error("Account deletion request failed:", error);
    return { success: false, error: "Cererea de stergere a esuat. Incearca din nou." };
  }
}

/**
 * Cancel a pending account deletion request.
 * Unbans the auth user and restores active status.
 */
export async function cancelAccountDeletion(): Promise<SuccessResult | ErrorResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Nu esti autentificat" };
    }

    const serviceClient = createServiceRoleClient();

    // Clear deletion request
    // deletion_requested_at and status columns added for GDPR -- not yet in generated types
    const { error: updateError } = await serviceClient
      .from("utilizatori")
      .update({
        deletion_requested_at: null,
        status: "active",
      } as Record<string, unknown>)
      .eq("id", user.id);

    if (updateError) {
      logger.error("Failed to cancel account deletion:", updateError);
      return { success: false, error: "Nu s-a putut anula cererea de stergere" };
    }

    // Unban user
    const { error: unbanError } = await serviceClient.auth.admin.updateUserById(user.id, {
      ban_duration: "none",
    });

    if (unbanError) {
      logger.error("Failed to unban user:", unbanError);
    }

    revalidatePath("/");

    return { success: true };
  } catch (error) {
    logger.error("Cancel account deletion failed:", error);
    return { success: false, error: "Anularea cererii a esuat. Incearca din nou." };
  }
}
