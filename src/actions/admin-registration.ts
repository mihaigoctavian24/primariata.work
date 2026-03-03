"use server";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { sendRegistrationApprovedEmail, sendRegistrationRejectedEmail } from "@/lib/email/sendgrid";

interface PendingRegistration {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  utilizatori: {
    email: string;
    prenume: string;
    nume: string;
    avatar_url: string | null;
  };
}

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Fetch all pending registrations for a primarie.
 * Uses the authenticated admin's session (RLS allows admin/primar to read user_primarii for their primarie).
 */
export async function getPendingRegistrations(primarieId: string): Promise<{
  data: PendingRegistration[];
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("user_primarii")
    .select(
      `
      id,
      user_id,
      status,
      created_at,
      utilizatori!inner (
        email,
        prenume,
        nume,
        avatar_url
      )
    `
    )
    .eq("primarie_id", primarieId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) {
    logger.error("Failed to fetch pending registrations:", error);
    return { data: [], error: "Failed to fetch" };
  }

  return { data: (data as unknown as PendingRegistration[]) ?? [] };
}

/**
 * Approve a pending registration.
 * Updates user_primarii status to approved, sends email + in-app notification to the user.
 */
export async function approveRegistration(
  registrationId: string,
  primarieId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Update user_primarii status (RLS allows admin/primar)
  const { data: updated, error: updateError } = await supabase
    .from("user_primarii")
    .update({
      status: "approved",
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", registrationId)
    .eq("primarie_id", primarieId)
    .eq("status", "pending")
    .select("user_id")
    .single();

  if (updateError || !updated) {
    logger.error("Failed to approve registration:", updateError);
    return { success: false, error: "Failed to approve registration" };
  }

  // Fetch user info for notification + email
  const serviceClient = createServiceRoleClient();
  const { data: userData } = await serviceClient
    .from("utilizatori")
    .select("email, prenume, nume")
    .eq("id", updated.user_id)
    .single();

  // Fetch primarie info for email content
  const { data: primarieData } = await serviceClient
    .from("primarii")
    .select("nume_oficial, localitati!inner(slug, judete!inner(slug))")
    .eq("id", primarieId)
    .single();

  const userName = userData ? `${userData.prenume} ${userData.nume}` : "Utilizator";
  const userEmail = userData?.email ?? "";
  const primarieName =
    (primarieData as unknown as { nume_oficial: string })?.nume_oficial ?? "Primaria";

  // Resolve dashboard link from primarie's judet/localitate slugs
  let dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work"}/app`;
  if (primarieData) {
    const primarieTyped = primarieData as unknown as {
      localitati: { slug: string; judete: { slug: string } };
    };
    dashboardLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work"}/app/${primarieTyped.localitati.judete.slug}/${primarieTyped.localitati.slug}`;
  }

  // Send approval email (fire and forget)
  try {
    if (userEmail) {
      sendRegistrationApprovedEmail(userEmail, userName, primarieName, dashboardLink).catch(
        (err: unknown) => logger.error("Failed to send approval email:", err)
      );
    }
  } catch {
    // Non-critical
  }

  // Create in-app notification for the user (service role for INSERT)
  try {
    await serviceClient.from("notifications").insert({
      utilizator_id: updated.user_id,
      primarie_id: primarieId,
      type: "registration_approved",
      priority: "high",
      title: "Inregistrare aprobata",
      message: `Inregistrarea dvs. la ${primarieName} a fost aprobata. Bine ati venit!`,
      action_url: dashboardLink.replace(
        process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work",
        ""
      ),
      action_label: "Acceseaza dashboard-ul",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    logger.error("Failed to create approval notification:", err);
  }

  revalidatePath("/app");
  return { success: true };
}

/**
 * Reject a pending registration with a reason.
 * Updates user_primarii status to rejected, sends email + in-app notification to the user.
 */
export async function rejectRegistration(
  registrationId: string,
  primarieId: string,
  reason: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  // Update user_primarii status (RLS allows admin/primar)
  const { data: updated, error: updateError } = await supabase
    .from("user_primarii")
    .update({
      status: "rejected",
      rejection_reason: reason,
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq("id", registrationId)
    .eq("primarie_id", primarieId)
    .eq("status", "pending")
    .select("user_id")
    .single();

  if (updateError || !updated) {
    logger.error("Failed to reject registration:", updateError);
    return { success: false, error: "Failed to reject registration" };
  }

  // Fetch user info for notification + email
  const serviceClient = createServiceRoleClient();
  const { data: userData } = await serviceClient
    .from("utilizatori")
    .select("email, prenume, nume")
    .eq("id", updated.user_id)
    .single();

  // Fetch primarie info
  const { data: primarieData } = await serviceClient
    .from("primarii")
    .select("nume_oficial, localitati!inner(slug, judete!inner(slug))")
    .eq("id", primarieId)
    .single();

  const userName = userData ? `${userData.prenume} ${userData.nume}` : "Utilizator";
  const userEmail = userData?.email ?? "";
  const primarieName =
    (primarieData as unknown as { nume_oficial: string })?.nume_oficial ?? "Primaria";

  // Build re-apply link
  let reapplyLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work"}/app`;
  if (primarieData) {
    const primarieTyped = primarieData as unknown as {
      localitati: { slug: string; judete: { slug: string } };
    };
    reapplyLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work"}/app/${primarieTyped.localitati.judete.slug}/${primarieTyped.localitati.slug}`;
  }

  // Send rejection email (fire and forget)
  try {
    if (userEmail) {
      sendRegistrationRejectedEmail(userEmail, userName, primarieName, reason, reapplyLink).catch(
        (err: unknown) => logger.error("Failed to send rejection email:", err)
      );
    }
  } catch {
    // Non-critical
  }

  // Create in-app notification for the user (service role for INSERT)
  try {
    await serviceClient.from("notifications").insert({
      utilizator_id: updated.user_id,
      primarie_id: primarieId,
      type: "registration_rejected",
      priority: "high",
      title: "Inregistrare respinsa",
      message: `Inregistrarea dvs. la ${primarieName} a fost respinsa. Motiv: ${reason}`,
      action_url: reapplyLink.replace(
        process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work",
        ""
      ),
      action_label: "Reaplica",
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    logger.error("Failed to create rejection notification:", err);
  }

  revalidatePath("/app");
  return { success: true };
}

/**
 * Notify all admin/primar users of a primarie about a new registration.
 * Uses service role to query admins and insert notifications.
 */
export async function notifyAdminNewRegistration(
  primarieId: string,
  userName: string
): Promise<void> {
  const serviceClient = createServiceRoleClient();

  // Find all admin/primar users for this primarie
  const { data: admins } = await serviceClient
    .from("user_primarii")
    .select("user_id")
    .eq("primarie_id", primarieId)
    .in("rol", ["admin", "primar"])
    .eq("status", "approved");

  if (!admins?.length) return;

  // Create notification for each admin
  const notifications = admins.map((admin) => ({
    utilizator_id: admin.user_id,
    primarie_id: primarieId,
    type: "registration_pending" as const,
    priority: "high" as const,
    title: "Cerere de inregistrare noua",
    message: `Utilizatorul ${userName} a solicitat inregistrarea la primaria dvs.`,
    action_url: "/admin/registrations",
    action_label: "Vedeti cererea",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const { error } = await serviceClient.from("notifications").insert(notifications);
  if (error) {
    logger.error("Failed to notify admins of new registration:", error);
  }
}
