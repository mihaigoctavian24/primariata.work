"use server";

import { createServiceRoleClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/get-auth-context";
import { revalidatePath } from "next/cache";

// ============================================================================
// updateUserStatus
// ============================================================================

/**
 * Update a user's status (activ / suspendat / inactiv / pending).
 * Uses service role to bypass RLS. Caller must be admin.
 */
export async function updateUserStatus(
  userId: string,
  newStatus: "activ" | "suspendat" | "inactiv" | "pending",
  primarieId: string
): Promise<{ error?: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const admin = createServiceRoleClient();

  const activ = newStatus === "activ";
  const { error } = await admin
    .from("utilizatori")
    .update({ status: newStatus, activ })
    .eq("id", userId)
    .eq("primarie_id", primarieId);

  if (error) return { error: error.message };

  // Also sync user_primarii status
  const primariiStatus =
    newStatus === "activ"
      ? "approved"
      : newStatus === "suspendat"
        ? "suspended"
        : newStatus === "pending"
          ? "pending"
          : "rejected"; // map inactiv → rejected (closest semantic match in user_primarii)

  await admin
    .from("user_primarii")
    .update({ status: primariiStatus })
    .eq("user_id", userId)
    .eq("primarie_id", primarieId);

  revalidatePath("/", "layout");
  return {};
}

// ============================================================================
// updateUserRole
// ============================================================================

/**
 * Update a user's role.
 * Uses service role to bypass RLS. Caller must be admin.
 */
export async function updateUserRole(
  userId: string,
  newRole: string,
  primarieId: string
): Promise<{ error?: string }> {
  const ctx = await getAuthContext();
  if ("error" in ctx) return { error: ctx.error };

  const admin = createServiceRoleClient();

  const { error: utilizatoriError } = await admin
    .from("utilizatori")
    .update({ rol: newRole })
    .eq("id", userId)
    .eq("primarie_id", primarieId);

  if (utilizatoriError) return { error: utilizatoriError.message };

  // Sync user_primarii.rol if record exists
  // Cast required: function signature accepts string, DB type expects literal union
  const typedRole = newRole as "cetatean" | "functionar" | "admin" | "primar" | "super_admin";
  await admin
    .from("user_primarii")
    .update({ rol: typedRole })
    .eq("user_id", userId)
    .eq("primarie_id", primarieId);

  revalidatePath("/", "layout");
  return {};
}
