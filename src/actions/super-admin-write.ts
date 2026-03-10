"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import type { Json } from "@/types/database.types";

// ============================================================================
// Types
// ============================================================================

export interface CreatePrimarieInput {
  numeOficial: string;
  localitateId: number;
  email: string;
  tier: "Basic" | "Pro" | "Enterprise";
  adminEmail?: string;
}

export interface InviteAdminInput {
  primarieId: string;
  email: string;
  role: "admin" | "primar";
}

// ============================================================================
// Internal helpers
// ============================================================================

async function getSuperAdminUser(): Promise<
  | { success: true; user: { id: string; prenume: string; nume: string } }
  | { success: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Neautentificat" };

  const { data: userData } = await supabase
    .from("utilizatori")
    .select("rol, prenume, nume")
    .eq("id", user.id)
    .single();

  if (!userData || userData.rol !== "super_admin") {
    return { success: false, error: "Acces interzis" };
  }

  return {
    success: true,
    user: {
      id: user.id,
      prenume: userData.prenume,
      nume: userData.nume,
    },
  };
}

async function writeAuditLog(params: {
  utilizatorId: string;
  utilizatorNume: string;
  actiune: string;
  primarieId?: string;
  detalii?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = createServiceRoleClient();
    await admin.from("audit_log").insert({
      utilizator_id: params.utilizatorId,
      utilizator_nume: params.utilizatorNume,
      actiune: params.actiune,
      primarie_id: params.primarieId ?? null,
      detalii: (params.detalii ?? null) as unknown as Json,
      entitate_tip: "super_admin_action",
    });
  } catch (err) {
    logger.error("Failed to write audit log:", err);
  }
}

// ============================================================================
// suspendPrimarie
// ============================================================================

/**
 * Suspend a primarie: set status="suspended" and activa=false.
 * Writes an audit log entry.
 */
export async function suspendPrimarie(
  primarieId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await getSuperAdminUser();
    if (!authResult.success) return { success: false, error: authResult.error };

    const admin = createServiceRoleClient();
    const { error } = await admin
      .from("primarii")
      .update({ status: "suspended", activa: false })
      .eq("id", primarieId);

    if (error) {
      logger.error("suspendPrimarie DB error:", error);
      return { success: false, error: error.message };
    }

    await writeAuditLog({
      utilizatorId: authResult.user.id,
      utilizatorNume: `${authResult.user.prenume} ${authResult.user.nume}`,
      actiune: "suspend_primarie",
      primarieId,
      detalii: { primarieId },
    });

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in suspendPrimarie:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// activatePrimarie
// ============================================================================

/**
 * Activate a primarie: set status="active" and activa=true.
 * Writes an audit log entry.
 */
export async function activatePrimarie(
  primarieId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await getSuperAdminUser();
    if (!authResult.success) return { success: false, error: authResult.error };

    const admin = createServiceRoleClient();
    const { error } = await admin
      .from("primarii")
      .update({ status: "active", activa: true })
      .eq("id", primarieId);

    if (error) {
      logger.error("activatePrimarie DB error:", error);
      return { success: false, error: error.message };
    }

    await writeAuditLog({
      utilizatorId: authResult.user.id,
      utilizatorNume: `${authResult.user.prenume} ${authResult.user.nume}`,
      actiune: "activate_primarie",
      primarieId,
      detalii: { primarieId },
    });

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in activatePrimarie:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// suspendAdmin
// ============================================================================

/**
 * Suspend an admin: set user_primarii.status="suspended" for admin/primar roles.
 * Writes an audit log entry.
 */
export async function suspendAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await getSuperAdminUser();
    if (!authResult.success) return { success: false, error: authResult.error };

    const admin = createServiceRoleClient();
    const { error } = await admin
      .from("user_primarii")
      .update({ status: "suspended" })
      .eq("user_id", userId)
      .in("rol", ["admin", "primar"]);

    if (error) {
      logger.error("suspendAdmin DB error:", error);
      return { success: false, error: error.message };
    }

    await writeAuditLog({
      utilizatorId: authResult.user.id,
      utilizatorNume: `${authResult.user.prenume} ${authResult.user.nume}`,
      actiune: "suspend_admin",
      detalii: { userId },
    });

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in suspendAdmin:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// activateAdmin
// ============================================================================

/**
 * Activate an admin: set user_primarii.status="approved" for admin/primar roles.
 * Writes an audit log entry.
 */
export async function activateAdmin(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await getSuperAdminUser();
    if (!authResult.success) return { success: false, error: authResult.error };

    const admin = createServiceRoleClient();
    const { error } = await admin
      .from("user_primarii")
      .update({ status: "approved" })
      .eq("user_id", userId)
      .in("rol", ["admin", "primar"]);

    if (error) {
      logger.error("activateAdmin DB error:", error);
      return { success: false, error: error.message };
    }

    await writeAuditLog({
      utilizatorId: authResult.user.id,
      utilizatorNume: `${authResult.user.prenume} ${authResult.user.nume}`,
      actiune: "activate_admin",
      detalii: { userId },
    });

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in activateAdmin:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// createPrimarie
// ============================================================================

/**
 * Create a new primarie and optionally invite an admin.
 * Inserts a primarii row, writes audit log, and optionally calls inviteAdminToPrimarie.
 */
export async function createPrimarie(
  data: CreatePrimarieInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await getSuperAdminUser();
    if (!authResult.success) return { success: false, error: authResult.error };

    const admin = createServiceRoleClient();
    // Generate slug from name: lowercase, replace diacritics, replace spaces with hyphens
    const slug = data.numeOficial
      .toLowerCase()
      .replace(/[ăâ]/g, "a")
      .replace(/[îi]/g, "i")
      .replace(/[șş]/g, "s")
      .replace(/[țţ]/g, "t")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const { data: inserted, error } = await admin
      .from("primarii")
      .insert({
        nume_oficial: data.numeOficial,
        localitate_id: data.localitateId,
        email: data.email,
        activa: true,
        status: "active",
        config: { tier: data.tier },
        slug,
      })
      .select("id")
      .single();

    if (error) {
      logger.error("createPrimarie insert error:", error);
      return { success: false, error: error.message };
    }

    const newPrimarieId: string = inserted.id;

    await writeAuditLog({
      utilizatorId: authResult.user.id,
      utilizatorNume: `${authResult.user.prenume} ${authResult.user.nume}`,
      actiune: "create_primarie",
      primarieId: newPrimarieId,
      detalii: { numeOficial: data.numeOficial },
    });

    if (data.adminEmail) {
      await inviteAdminToPrimarie({
        primarieId: newPrimarieId,
        email: data.adminEmail,
        role: "admin",
      });
    }

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in createPrimarie:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}

// ============================================================================
// inviteAdminToPrimarie
// ============================================================================

/**
 * Invite an admin to a specific primarie via Supabase auth.admin.inviteUserByEmail.
 * Writes an audit log entry.
 */
export async function inviteAdminToPrimarie(
  data: InviteAdminInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const authResult = await getSuperAdminUser();
    if (!authResult.success) return { success: false, error: authResult.error };

    const admin = createServiceRoleClient();
    const { error } = await admin.auth.admin.inviteUserByEmail(data.email, {
      data: { rol: data.role, primarie_id: data.primarieId },
    });

    if (error) {
      logger.error("inviteAdminToPrimarie invite error:", error);
      return { success: false, error: error.message };
    }

    await writeAuditLog({
      utilizatorId: authResult.user.id,
      utilizatorNume: `${authResult.user.prenume} ${authResult.user.nume}`,
      actiune: "invite_admin",
      primarieId: data.primarieId,
      detalii: { email: data.email, role: data.role, primarieId: data.primarieId },
    });

    return { success: true };
  } catch (error) {
    logger.error("Unexpected error in inviteAdminToPrimarie:", error);
    return { success: false, error: "A apărut o eroare" };
  }
}
