/**
 * SendGrid Email Client
 *
 * Client wrapper for sending emails via Supabase Edge Function
 * Uses SendGrid API through edge function for transactional emails
 */

import { createServiceRoleClient } from "@/lib/supabase/server";
import type { EmailRequest, EmailResponse } from "./types";

/**
 * Send email via SendGrid Edge Function
 *
 * @param request - Email request with type and recipient details
 * @returns Promise with email send result
 *
 * @example
 * ```typescript
 * // Send cerere submitted email
 * await sendEmail({
 *   type: "cerere_submitted",
 *   toEmail: "user@example.com",
 *   toName: "Ion Popescu",
 *   cerereId: "cerere-uuid-here"
 * });
 *
 * // Send payment confirmation email
 * await sendEmail({
 *   type: "payment_completed",
 *   toEmail: "user@example.com",
 *   toName: "Ion Popescu",
 *   plataId: "plata-uuid-here"
 * });
 * ```
 */
export async function sendEmail(request: EmailRequest): Promise<EmailResponse> {
  try {
    // Use service role client to invoke edge function
    const supabase = createServiceRoleClient();

    // Invoke send-email edge function
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: request,
    });

    if (error) {
      console.error("Error invoking send-email function:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
        details: JSON.stringify(error),
      };
    }

    // Check if edge function returned error
    if (data && data.error) {
      console.error("Edge function returned error:", data.error);
      return {
        success: false,
        error: data.error,
        details: data.details,
      };
    }

    console.log(`Email sent successfully: ${request.type} to ${request.toEmail}`);

    return {
      success: true,
      message: data?.message || "Email sent successfully",
    };
  } catch (error) {
    console.error("Unexpected error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Send cerere submitted notification
 */
export async function sendCerereSubmittedEmail(
  toEmail: string,
  toName: string,
  cerereId: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "cerere_submitted",
    toEmail,
    toName,
    cerereId,
  });
}

/**
 * Send cerere status update notification
 */
export async function sendCerereStatusChangedEmail(
  toEmail: string,
  toName: string,
  cerereId: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "status_changed",
    toEmail,
    toName,
    cerereId,
  });
}

/**
 * Send cerere finalized notification
 */
export async function sendCerereFinalizataEmail(
  toEmail: string,
  toName: string,
  cerereId: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "cerere_finalizata",
    toEmail,
    toName,
    cerereId,
  });
}

/**
 * Send payment completed notification
 */
export async function sendPaymentCompletedEmail(
  toEmail: string,
  toName: string,
  plataId: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "payment_completed",
    toEmail,
    toName,
    plataId,
  });
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedEmail(
  toEmail: string,
  toName: string,
  plataId: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "payment_failed",
    toEmail,
    toName,
    plataId,
  });
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(toEmail: string, toName: string): Promise<EmailResponse> {
  return sendEmail({
    type: "welcome",
    toEmail,
    toName,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  resetLink: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "password_reset",
    toEmail,
    toName,
    resetLink,
  });
}

/**
 * Send weekly digest of active cereri
 */
export async function sendWeeklyDigestEmail(
  toEmail: string,
  toName: string,
  cererePending: number,
  cerereInProgress: number
): Promise<EmailResponse> {
  return sendEmail({
    type: "weekly_digest",
    toEmail,
    toName,
    cererePending,
    cerereInProgress,
  });
}
