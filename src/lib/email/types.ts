/**
 * Email Types
 *
 * Type definitions for email sending via SendGrid Edge Function
 */

export type EmailType =
  | "cerere_submitted"
  | "status_changed"
  | "cerere_finalizata"
  | "cerere_respinsa"
  | "payment_initiated"
  | "payment_completed"
  | "payment_failed"
  | "document_signed"
  | "batch_signature_completed"
  | "welcome"
  | "password_reset"
  | "weekly_digest";

export interface BaseEmailRequest {
  type: EmailType;
  toEmail: string;
  toName: string;
}

export interface CerereEmailRequest extends BaseEmailRequest {
  type: "cerere_submitted" | "status_changed" | "cerere_finalizata" | "cerere_respinsa";
  cerereId: string;
}

export interface PaymentEmailRequest extends BaseEmailRequest {
  type: "payment_initiated" | "payment_completed" | "payment_failed";
  plataId: string;
}

export interface SignatureEmailRequest extends BaseEmailRequest {
  type: "document_signed";
  transactionId: string;
}

export interface BatchSignatureEmailRequest extends BaseEmailRequest {
  type: "batch_signature_completed";
  sessionId: string;
}

export interface WelcomeEmailRequest extends BaseEmailRequest {
  type: "welcome";
}

export interface PasswordResetEmailRequest extends BaseEmailRequest {
  type: "password_reset";
  resetLink: string;
}

export interface WeeklyDigestEmailRequest extends BaseEmailRequest {
  type: "weekly_digest";
  cererePending?: number;
  cerereInProgress?: number;
}

export type EmailRequest =
  | CerereEmailRequest
  | PaymentEmailRequest
  | SignatureEmailRequest
  | BatchSignatureEmailRequest
  | WelcomeEmailRequest
  | PasswordResetEmailRequest
  | WeeklyDigestEmailRequest;

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
}
