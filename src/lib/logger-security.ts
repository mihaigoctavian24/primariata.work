export type SecurityEventType = "auth" | "webhook" | "rls" | "role_change" | "csrf";

export type SecurityAction =
  | "login_success"
  | "login_failure"
  | "registration"
  | "password_reset"
  | "session_refresh"
  | "session_expired"
  | "webhook_verified"
  | "webhook_rejected"
  | "access_denied"
  | "access_granted"
  | "role_promoted"
  | "role_demoted"
  | "csrf_failure"
  | "primarie_switch";

export interface SecurityEvent {
  type: SecurityEventType;
  action: SecurityAction;
  userId?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
}
