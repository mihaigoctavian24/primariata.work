/**
 * Twilio SMS Client
 *
 * Client wrapper for sending SMS notifications via Twilio API
 * Used for cerere status updates and important notifications
 */

import { createServiceRoleClient } from "@/lib/supabase/server";

// Twilio API configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Rate limiting constants
const MAX_SMS_PER_DAY = 5;
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface SMSRequest {
  type: "cerere_submitted" | "status_changed" | "cerere_finalizata";
  toPhone: string;
  cerereId: string;
  userId: string;
}

export interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  sid?: string; // Twilio message SID
}

/**
 * Check if user has reached SMS rate limit
 */
async function checkRateLimit(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - RATE_LIMIT_WINDOW);

  // Count SMS sent in last 24 hours
  const { count, error } = await supabase
    .from("sms_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneDayAgo.toISOString());

  if (error) {
    console.error("Error checking rate limit:", error);
    return false; // Allow on error (fail open)
  }

  return (count || 0) < MAX_SMS_PER_DAY;
}

/**
 * Log SMS send attempt
 */
async function logSMS(
  userId: string,
  phone: string,
  type: string,
  success: boolean,
  sid?: string,
  error?: string
): Promise<void> {
  const supabase = createServiceRoleClient();

  await supabase.from("sms_logs").insert({
    user_id: userId,
    phone_number: phone,
    message_type: type,
    success,
    twilio_sid: sid,
    error_message: error,
  });
}

/**
 * Get SMS template based on type and cerere data
 */
async function getSMSTemplate(type: string, cerereId: string): Promise<string | null> {
  const supabase = createServiceRoleClient();

  // Fetch cerere details
  const { data: cerere, error } = await supabase
    .from("cereri")
    .select("numar_inregistrare, status, tip_cerere:tipuri_cereri(nume)")
    .eq("id", cerereId)
    .single();

  if (error || !cerere) {
    console.error("Error fetching cerere for SMS:", error);
    return null;
  }

  const numarCerere = cerere.numar_inregistrare;
  const tipCerere = cerere.tip_cerere?.nume || "cerere";

  // Generate message based on type
  switch (type) {
    case "cerere_submitted":
      return `Cererea ta ${numarCerere} (${tipCerere}) a fost înregistrată cu succes! Vei primi notificări la fiecare actualizare.`;

    case "status_changed":
      const statusLabels: Record<string, string> = {
        pending: "În așteptare",
        in_review: "În revizie",
        in_progress: "În procesare",
        approved: "Aprobată",
        rejected: "Respinsă",
        completed: "Finalizată",
      };
      const statusLabel = statusLabels[cerere.status] || cerere.status;
      return `Actualizare cerere ${numarCerere}: ${statusLabel}. Verifică aplicația pentru detalii.`;

    case "cerere_finalizata":
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work";
      const cerereLink = `${appUrl}/app/cereri/${cerereId}`;
      return `Cererea ${numarCerere} este gata! Documentele semnate pot fi descărcate: ${cerereLink}`;

    default:
      return null;
  }
}

/**
 * Send SMS via Twilio API
 */
async function sendTwilioSMS(
  to: string,
  body: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  // Check if Twilio is configured
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.error("Twilio credentials not configured");
    return {
      success: false,
      error: "Twilio credentials missing",
    };
  }

  try {
    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

    // Basic Auth header
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

    // Send SMS via Twilio API
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER,
        Body: body,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Twilio API error:", data);
      return {
        success: false,
        error: data.message || "Twilio API error",
      };
    }

    console.log(`SMS sent successfully: ${data.sid} to ${to}`);
    return {
      success: true,
      sid: data.sid,
    };
  } catch (error) {
    console.error("Error sending SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check if user has SMS notifications enabled
 */
async function isSMSEnabled(userId: string): Promise<boolean> {
  const supabase = createServiceRoleClient();

  const { data: user, error } = await supabase
    .from("utilizatori")
    .select("sms_notifications_enabled")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error checking SMS preference:", error);
    return false; // Default to disabled on error
  }

  return user?.sms_notifications_enabled || false;
}

/**
 * Main function: Send SMS notification
 *
 * @param request - SMS request with type, phone, cerere ID, and user ID
 * @returns Promise with SMS send result
 *
 * @example
 * ```typescript
 * // Send cerere submitted SMS
 * await sendSMS({
 *   type: "cerere_submitted",
 *   toPhone: "+40723456789",
 *   cerereId: "cerere-uuid-here",
 *   userId: "user-uuid-here"
 * });
 * ```
 */
export async function sendSMS(request: SMSRequest): Promise<SMSResponse> {
  const { type, toPhone, cerereId, userId } = request;

  try {
    // 1. Check if user has SMS enabled
    const smsEnabled = await isSMSEnabled(userId);
    if (!smsEnabled) {
      console.log(`SMS notifications disabled for user ${userId}`);
      return {
        success: false,
        error: "SMS notifications disabled by user",
      };
    }

    // 2. Check rate limit
    const withinLimit = await checkRateLimit(userId);
    if (!withinLimit) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      await logSMS(userId, toPhone, type, false, undefined, "Rate limit exceeded");
      return {
        success: false,
        error: "Rate limit exceeded (max 5 SMS/day)",
      };
    }

    // 3. Get SMS template
    const message = await getSMSTemplate(type, cerereId);
    if (!message) {
      console.error(`Failed to generate SMS template for type: ${type}`);
      return {
        success: false,
        error: "Failed to generate SMS message",
      };
    }

    // 4. Send SMS via Twilio
    const result = await sendTwilioSMS(toPhone, message);

    // 5. Log SMS send attempt
    await logSMS(userId, toPhone, type, result.success, result.sid, result.error);

    if (result.success) {
      return {
        success: true,
        message: "SMS sent successfully",
        sid: result.sid,
      };
    } else {
      return {
        success: false,
        error: result.error || "Failed to send SMS",
      };
    }
  } catch (error) {
    console.error("Unexpected error sending SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Helper function: Send cerere submitted SMS
 */
export async function sendCerereSubmittedSMS(
  toPhone: string,
  cerereId: string,
  userId: string
): Promise<SMSResponse> {
  return sendSMS({
    type: "cerere_submitted",
    toPhone,
    cerereId,
    userId,
  });
}

/**
 * Helper function: Send status changed SMS
 */
export async function sendStatusChangedSMS(
  toPhone: string,
  cerereId: string,
  userId: string
): Promise<SMSResponse> {
  return sendSMS({
    type: "status_changed",
    toPhone,
    cerereId,
    userId,
  });
}

/**
 * Helper function: Send cerere finalized SMS
 */
export async function sendCerereFinalizataSMS(
  toPhone: string,
  cerereId: string,
  userId: string
): Promise<SMSResponse> {
  return sendSMS({
    type: "cerere_finalizata",
    toPhone,
    cerereId,
    userId,
  });
}
