"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { notifyAdminNewRegistration } from "@/actions/admin-registration";

interface RegistrationResult {
  success: boolean;
  error?: string;
}

/**
 * Register current user at a new primarie (for existing users visiting a new primarie).
 * Creates a pending user_primarii row via service role (bypasses RLS -- no self-insert policy).
 * Auth check via getUser() ensures only authenticated users can call this action.
 */
export async function registerAtPrimarie(primarieId: string): Promise<RegistrationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const serviceClient = createServiceRoleClient();

  // Check for existing association
  const { data: existing } = await serviceClient
    .from("user_primarii")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("primarie_id", primarieId)
    .single();

  if (existing) {
    if (existing.status === "pending") {
      return { success: false, error: "Registration already pending" };
    }
    if (existing.status === "approved") {
      return { success: false, error: "Already registered at this primarie" };
    }
    // If rejected or suspended, they should use reapply
    return { success: false, error: "Use re-apply to register again" };
  }

  const { error } = await serviceClient.from("user_primarii").insert({
    user_id: user.id,
    primarie_id: primarieId,
    rol: "cetatean",
    status: "pending",
  });

  if (error) {
    logger.error("Failed to register at primarie:", error);
    return { success: false, error: "Registration failed" };
  }

  // Notify admins about the new registration (fire and forget)
  try {
    const { data: userData } = await serviceClient
      .from("utilizatori")
      .select("prenume, nume")
      .eq("id", user.id)
      .single();
    const userName = userData
      ? `${userData.prenume} ${userData.nume}`
      : (user.email ?? "Utilizator");
    notifyAdminNewRegistration(primarieId, userName).catch((err) =>
      logger.error("Failed to notify admin:", err)
    );
  } catch {
    // Non-critical -- don't fail registration
  }

  revalidatePath("/app");
  return { success: true };
}

/**
 * Re-apply at a primarie after rejection.
 * Updates existing rejected row to pending. The audit_log trigger
 * (if configured) captures the old state for traceability.
 */
export async function reapplyAtPrimarie(primarieId: string): Promise<RegistrationResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const serviceClient = createServiceRoleClient();

  // Find existing rejected row
  const { data: existing } = await serviceClient
    .from("user_primarii")
    .select("id, status, rejection_reason")
    .eq("user_id", user.id)
    .eq("primarie_id", primarieId)
    .eq("status", "rejected")
    .single();

  if (!existing) {
    return { success: false, error: "No rejected registration found" };
  }

  // Update back to pending
  const { error } = await serviceClient
    .from("user_primarii")
    .update({
      status: "pending",
      rejection_reason: null,
      approved_by: null,
      approved_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existing.id);

  if (error) {
    logger.error("Failed to re-apply at primarie:", error);
    return { success: false, error: "Re-apply failed" };
  }

  revalidatePath("/app");
  return { success: true };
}
