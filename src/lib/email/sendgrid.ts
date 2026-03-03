/**
 * SendGrid Email Client
 *
 * Client wrapper for sending emails via Supabase Edge Function
 * Uses SendGrid API through edge function for transactional emails
 */

import { logger } from "@/lib/logger";
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
      logger.error("Error invoking send-email function:", error);
      return {
        success: false,
        error: error.message || "Failed to send email",
        details: JSON.stringify(error),
      };
    }

    // Check if edge function returned error
    if (data && data.error) {
      logger.error("Edge function returned error:", data.error);
      return {
        success: false,
        error: data.error,
        details: data.details,
      };
    }

    logger.debug(`Email sent successfully: ${request.type} to ${request.toEmail}`);

    return {
      success: true,
      message: data?.message || "Email sent successfully",
    };
  } catch (error) {
    logger.error("Unexpected error sending email:", error);
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

/**
 * Send registration approved notification
 */
export async function sendRegistrationApprovedEmail(
  toEmail: string,
  toName: string,
  primarieName: string,
  dashboardLink: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "registration_approved",
    toEmail,
    toName,
    primarieName,
    dashboardLink,
  });
}

/**
 * Send registration rejected notification
 */
export async function sendRegistrationRejectedEmail(
  toEmail: string,
  toName: string,
  primarieName: string,
  rejectionReason: string,
  reapplyLink: string,
  primarieEmail?: string
): Promise<EmailResponse> {
  return sendEmail({
    type: "registration_rejected",
    toEmail,
    toName,
    primarieName,
    rejectionReason,
    reapplyLink,
    primarieEmail,
  });
}
