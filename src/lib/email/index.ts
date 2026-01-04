/**
 * Email Module Exports
 */

export {
  sendEmail,
  sendCerereSubmittedEmail,
  sendCerereStatusChangedEmail,
  sendCerereFinalizataEmail,
  sendPaymentCompletedEmail,
  sendPaymentFailedEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendWeeklyDigestEmail,
} from "./sendgrid";

export type {
  EmailType,
  EmailRequest,
  EmailResponse,
  BaseEmailRequest,
  CerereEmailRequest,
  PaymentEmailRequest,
  SignatureEmailRequest,
  BatchSignatureEmailRequest,
} from "./types";
