"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";
import { ACCENT_PRESETS } from "@/store/accent-color-store";
import {
  profileSchema,
  primarieConfigSchema,
  notificationPrefsSchema,
  passwordChangeSchema,
  type ProfileFormValues,
  type PrimarieConfigFormValues,
  type NotificationPrefsFormValues,
  type PasswordChangeFormValues,
} from "@/lib/validations/admin-settings";

// ============================================================================
// Types
// ============================================================================

interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface SettingsPageData {
  user: {
    id: string;
    email: string;
    nume: string;
    prenume: string;
    telefon: string | null;
  };
  primarie: {
    id: string;
    email: string | null;
    telefon: string | null;
    adresa: string | null;
    program_lucru: string | null;
    nume_oficial: string;
    config: {
      maintenance_mode: boolean;
      auto_approve: boolean;
      accent_preset: string;
      cui: string;
      notificari_registrari: boolean;
      notificari_cereri: boolean;
    };
  };
  notificationPrefs: {
    email: { enabled: boolean; cereri: boolean; plati: boolean; sistem: boolean };
    push: { enabled: boolean; cereri: boolean; plati: boolean; sistem: boolean };
    sms: { enabled: boolean; cereri: boolean; plati: boolean; sistem: boolean };
  };
}

// ============================================================================
// Helper: get authenticated user + primarie ID
// ============================================================================

async function getAuthContext(): Promise<
  | {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      supabase: any;
      userId: string;
      primarieId: string;
      error?: string;
    }
  | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Autentificare necesara" };
  }

  const headersList = await headers();
  const primarieId = headersList.get("x-primarie-id");

  if (!primarieId) {
    return { error: "Primaria nu a fost identificata" };
  }

  return { supabase, userId: user.id, primarieId };
}

// ============================================================================
// 1. getSettingsPageData
// ============================================================================

/**
 * Fetch ALL data needed for the admin settings page in one call.
 * Returns user profile, primarie config, and notification preferences.
 */
export async function getSettingsPageData(): Promise<{
  success: boolean;
  data?: SettingsPageData;
  error?: string;
}> {
  try {
    const ctx = await getAuthContext();
    if ("error" in ctx && !("supabase" in ctx)) {
      return { success: false, error: ctx.error };
    }
    const { supabase, userId, primarieId } = ctx as Exclude<typeof ctx, { error: string }>;

    // Parallel queries for user profile and primarie config
    const [userResult, primarieResult, authUserResult] = await Promise.all([
      supabase
        .from("utilizatori")
        .select("id, email, nume, prenume, telefon")
        .eq("id", userId)
        .single(),
      supabase
        .from("primarii")
        .select("id, email, telefon, adresa, program_lucru, nume_oficial, config")
        .eq("id", primarieId)
        .single(),
      supabase.auth.getUser(),
    ]);

    if (userResult.error) {
      logger.error("Error fetching user profile for settings:", userResult.error);
      return { success: false, error: "Eroare la incarcarea profilului" };
    }

    if (primarieResult.error) {
      logger.error("Error fetching primarie config for settings:", primarieResult.error);
      return { success: false, error: "Eroare la incarcarea setarilor primariei" };
    }

    const userData = userResult.data;
    const primarieData = primarieResult.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawConfig = (primarieData.config as Record<string, any>) ?? {};

    // Extract notification preferences from auth user_metadata
    const authUser = authUserResult.data?.user;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userMetadata = (authUser?.user_metadata ?? {}) as Record<string, any>;
    const defaultChannel = { enabled: true, cereri: true, plati: true, sistem: true };
    const storedPrefs = userMetadata.notification_prefs;

    return {
      success: true,
      data: {
        user: {
          id: userData.id,
          email: userData.email,
          nume: userData.nume,
          prenume: userData.prenume,
          telefon: userData.telefon,
        },
        primarie: {
          id: primarieData.id,
          email: primarieData.email,
          telefon: primarieData.telefon,
          adresa: primarieData.adresa,
          program_lucru: primarieData.program_lucru,
          nume_oficial: primarieData.nume_oficial,
          config: {
            maintenance_mode: rawConfig.maintenance_mode ?? false,
            auto_approve: rawConfig.auto_approve ?? false,
            accent_preset: rawConfig.accent_preset ?? "crimson",
            cui: rawConfig.cui ?? "",
            notificari_registrari: rawConfig.notificari_registrari ?? true,
            notificari_cereri: rawConfig.notificari_cereri ?? true,
          },
        },
        notificationPrefs: {
          email: storedPrefs?.email ?? defaultChannel,
          push: storedPrefs?.push ?? defaultChannel,
          sms: storedPrefs?.sms ?? { ...defaultChannel, enabled: false },
        },
      },
    };
  } catch (error) {
    logger.error("Unexpected error in getSettingsPageData:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

// ============================================================================
// 2. updateAdminProfile
// ============================================================================

/**
 * Update admin user profile (name, phone). Email change triggers confirmation email.
 */
export async function updateAdminProfile(values: ProfileFormValues): Promise<ActionResult> {
  try {
    const parsed = profileSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    }

    const ctx = await getAuthContext();
    if ("error" in ctx && !("supabase" in ctx)) {
      return { success: false, error: ctx.error };
    }
    const { supabase, userId } = ctx as Exclude<typeof ctx, { error: string }>;

    // Update utilizatori table (name + phone only)
    const { error: updateError } = await supabase
      .from("utilizatori")
      .update({
        nume: parsed.data.nume,
        prenume: parsed.data.prenume,
        telefon: parsed.data.telefon || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (updateError) {
      logger.error("Error updating admin profile:", updateError);
      return { success: false, error: "Eroare la actualizarea profilului" };
    }

    // If email changed, trigger Supabase Auth email change (sends confirmation)
    const { data: currentUser } = await supabase.auth.getUser();
    if (currentUser?.user?.email !== parsed.data.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: parsed.data.email,
      });

      if (emailError) {
        logger.error("Error updating email:", emailError);
        return {
          success: true,
          message: "Profilul a fost actualizat, dar emailul nu a putut fi schimbat",
        };
      }

      return {
        success: true,
        message: "Profilul a fost actualizat. Un email de confirmare a fost trimis la noua adresa.",
      };
    }

    return { success: true, message: "Profilul a fost actualizat cu succes" };
  } catch (error) {
    logger.error("Unexpected error in updateAdminProfile:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

// ============================================================================
// 3. updatePrimarieConfig
// ============================================================================

/**
 * Update primarie configuration (contact info, maintenance mode, auto-approve, CUI).
 * Merges config fields into existing JSONB.
 */
export async function updatePrimarieConfig(
  primarieId: string,
  values: PrimarieConfigFormValues
): Promise<ActionResult> {
  try {
    const parsed = primarieConfigSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    }

    const ctx = await getAuthContext();
    if ("error" in ctx && !("supabase" in ctx)) {
      return { success: false, error: ctx.error };
    }
    const { supabase } = ctx as Exclude<typeof ctx, { error: string }>;

    // Verify admin/primar role
    const userId = (ctx as Exclude<typeof ctx, { error: string }>).userId;
    const { data: userPrimarie } = await supabase
      .from("user_primarii")
      .select("rol")
      .eq("user_id", userId)
      .eq("primarie_id", primarieId)
      .eq("status", "approved")
      .single();

    if (!userPrimarie || !["admin", "primar"].includes(userPrimarie.rol)) {
      return { success: false, error: "Acces interzis" };
    }

    // Read current config to merge
    const serviceClient = createServiceRoleClient();
    const { data: currentPrimarie } = await serviceClient
      .from("primarii")
      .select("config")
      .eq("id", primarieId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentConfig = (currentPrimarie?.config as Record<string, any>) ?? {};

    const mergedConfig = {
      ...currentConfig,
      maintenance_mode: parsed.data.maintenance_mode,
      auto_approve: parsed.data.auto_approve,
      cui: parsed.data.cui || "",
      notificari_registrari: parsed.data.notificari_registrari,
      notificari_cereri: parsed.data.notificari_cereri,
    };

    const { error: updateError } = await serviceClient
      .from("primarii")
      .update({
        email: parsed.data.email || null,
        telefon: parsed.data.telefon || null,
        adresa: parsed.data.adresa || null,
        program_lucru: parsed.data.program_lucru || null,
        config: mergedConfig,
        updated_at: new Date().toISOString(),
      })
      .eq("id", primarieId);

    if (updateError) {
      logger.error("Error updating primarie config:", updateError);
      return { success: false, error: "Eroare la salvarea setarilor primariei" };
    }

    return { success: true, message: "Setarile primariei au fost actualizate" };
  } catch (error) {
    logger.error("Unexpected error in updatePrimarieConfig:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

// ============================================================================
// 4. updateNotificationPrefs
// ============================================================================

/**
 * Save notification preferences (channel x category matrix) to auth user_metadata.
 */
export async function updateNotificationPrefs(
  values: NotificationPrefsFormValues
): Promise<ActionResult> {
  try {
    const parsed = notificationPrefsSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { notification_prefs: parsed.data },
    });

    if (updateError) {
      logger.error("Error updating notification preferences:", updateError);
      return { success: false, error: "Eroare la salvarea preferintelor de notificare" };
    }

    return { success: true, message: "Preferintele de notificare au fost salvate" };
  } catch (error) {
    logger.error("Unexpected error in updateNotificationPrefs:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

// ============================================================================
// 5. changePassword
// ============================================================================

/**
 * Change password after verifying current password via RPC.
 */
export async function changePassword(values: PasswordChangeFormValues): Promise<ActionResult> {
  try {
    const parsed = passwordChangeSchema.safeParse(values);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? "Date invalide" };
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Autentificare necesara" };
    }

    // Step 1: Verify current password via RPC
    // verify_user_password is a custom SECURITY DEFINER function (migration pending)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: isValid, error: rpcError } = await (supabase as any).rpc("verify_user_password", {
      password: values.currentPassword,
    });

    if (rpcError) {
      logger.error("Error verifying password via RPC:", rpcError);
      return { success: false, error: "Eroare la verificarea parolei" };
    }

    if (!isValid) {
      return { success: false, error: "Parola actuala este incorecta" };
    }

    // Step 2: Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: values.newPassword,
    });

    if (updateError) {
      logger.error("Error updating password:", updateError);
      return { success: false, error: "Eroare la schimbarea parolei" };
    }

    return { success: true, message: "Parola a fost schimbata cu succes" };
  } catch (error) {
    logger.error("Unexpected error in changePassword:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}

// ============================================================================
// 6. updateAppearance
// ============================================================================

/**
 * Update primarie accent color preset in config JSONB.
 */
export async function updateAppearance(primarieId: string, preset: string): Promise<ActionResult> {
  try {
    const validPreset = ACCENT_PRESETS.find((p) => p.name === preset);
    if (!validPreset) {
      return { success: false, error: "Preset de culoare invalid" };
    }

    const ctx = await getAuthContext();
    if ("error" in ctx && !("supabase" in ctx)) {
      return { success: false, error: ctx.error };
    }
    const { supabase } = ctx as Exclude<typeof ctx, { error: string }>;

    // Verify admin/primar role
    const userId = (ctx as Exclude<typeof ctx, { error: string }>).userId;
    const { data: userPrimarie } = await supabase
      .from("user_primarii")
      .select("rol")
      .eq("user_id", userId)
      .eq("primarie_id", primarieId)
      .eq("status", "approved")
      .single();

    if (!userPrimarie || !["admin", "primar"].includes(userPrimarie.rol)) {
      return { success: false, error: "Acces interzis" };
    }

    // Read current config to merge
    const serviceClient = createServiceRoleClient();
    const { data: currentPrimarie } = await serviceClient
      .from("primarii")
      .select("config")
      .eq("id", primarieId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentConfig = (currentPrimarie?.config as Record<string, any>) ?? {};

    const { error: updateError } = await serviceClient
      .from("primarii")
      .update({
        config: { ...currentConfig, accent_preset: preset },
        updated_at: new Date().toISOString(),
      })
      .eq("id", primarieId);

    if (updateError) {
      logger.error("Error updating appearance:", updateError);
      return { success: false, error: "Eroare la salvarea aspectului" };
    }

    return { success: true, message: "Aspectul a fost actualizat" };
  } catch (error) {
    logger.error("Unexpected error in updateAppearance:", error);
    return { success: false, error: "A aparut o eroare neasteptata" };
  }
}
