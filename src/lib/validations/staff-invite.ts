import { z } from "zod";
import { emailSchema, createSafeStringSchema, uuidSchema } from "./common";

/**
 * Staff Invitation Validation Schemas
 *
 * Provides type-safe validation for:
 * - Admin invitation creation
 * - Invitation acceptance
 * - Staff user management
 *
 * Security Features:
 * - Email validation (RFC 5321)
 * - XSS protection for text fields
 * - Role restriction (no super_admin)
 * - UUID validation for IDs
 * - Optional permissions JSONB
 */

// =============================================================================
// ROL VALIDATION
// =============================================================================

/**
 * Valid staff roles for invitations
 * Note: super_admin cannot be invited (security policy)
 */
export const staffRolEnum = z
  .enum(["functionar", "admin"])
  .describe("Rol invalid (functionar sau admin)");

export type StaffRol = z.infer<typeof staffRolEnum>;

// =============================================================================
// STAFF INVITATION SCHEMAS
// =============================================================================

/**
 * Schema for creating a new staff invitation
 *
 * Used by: Admin invite form, POST /api/admin/users/invite
 *
 * Fields:
 * - email: Recipient email (validated, normalized)
 * - nume: Last name (2-100 chars, XSS-safe)
 * - prenume: First name (2-100 chars, XSS-safe)
 * - rol: Staff role (functionar or admin only)
 * - primarie_id: Primărie UUID (validated)
 * - departament: Optional department/division
 * - permisiuni: Optional fine-grained permissions (JSONB)
 *
 * @example
 * {
 *   email: "john.doe@example.com",
 *   nume: "Doe",
 *   prenume: "John",
 *   rol: "functionar",
 *   primarie_id: "123e4567-e89b-12d3-a456-426614174000",
 *   departament: "Registratură",
 *   permisiuni: { "cereri:read": true, "cereri:write": false }
 * }
 */
export const inviteStaffSchema = z.object({
  // Email validation (RFC 5321, normalized to lowercase)
  email: emailSchema,

  // Name validation (XSS-safe, 2-100 chars)
  nume: createSafeStringSchema({
    minLength: 2,
    maxLength: 100,
    sanitize: true,
  }),

  prenume: createSafeStringSchema({
    minLength: 2,
    maxLength: 100,
    sanitize: true,
  }),

  // Role validation (functionar or admin only)
  rol: staffRolEnum,

  // Primărie ID validation (must be valid UUID)
  primarie_id: uuidSchema,

  // Optional department/division
  departament: createSafeStringSchema({
    minLength: 2,
    maxLength: 200,
    sanitize: true,
    allowEmpty: true,
  }).optional(),

  // Optional permissions (JSONB - future enhancement)
  permisiuni: z.record(z.string(), z.boolean()).optional(),
});

export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>;

/**
 * Schema for accepting an invitation
 *
 * Used by: Accept invitation form, public registration with token
 *
 * Fields:
 * - password: Strong password (min 8 chars, complexity requirements)
 * - confirmPassword: Must match password
 *
 * Note: invitation_token is passed separately in auth metadata
 *
 * @example
 * {
 *   password: "SecureP@ss123",
 *   confirmPassword: "SecureP@ss123"
 * }
 */
export const acceptInviteSchema = z
  .object({
    password: z
      .string()
      .min(8, "Parola trebuie să conțină cel puțin 8 caractere")
      .regex(/[A-Z]/, "Parola trebuie să conțină cel puțin o literă mare")
      .regex(/[a-z]/, "Parola trebuie să conțină cel puțin o literă mică")
      .regex(/[0-9]/, "Parola trebuie să conțină cel puțin o cifră")
      .regex(/[^A-Za-z0-9]/, "Parola trebuie să conțină cel puțin un caracter special"),

    confirmPassword: z.string().min(1, "Te rugăm să confirmi parola"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });

export type AcceptInviteFormData = z.infer<typeof acceptInviteSchema>;

// =============================================================================
// INVITATION QUERY FILTERS
// =============================================================================

/**
 * Schema for filtering invitations list
 *
 * Used by: GET /api/admin/users/invitations
 *
 * Filters:
 * - status: pending, accepted, expired, cancelled
 * - page: Pagination page number (min 1)
 * - limit: Results per page (10-100, default 20)
 *
 * @example
 * {
 *   status: "pending",
 *   page: 1,
 *   limit: 20
 * }
 */
export const invitationFiltersSchema = z.object({
  status: z.enum(["pending", "accepted", "expired", "cancelled"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(10).max(100).default(20),
});

export type InvitationFilters = z.infer<typeof invitationFiltersSchema>;

// =============================================================================
// STAFF USER FILTERS
// =============================================================================

/**
 * Schema for filtering staff users list
 *
 * Used by: GET /api/admin/users
 *
 * Filters:
 * - rol: functionar, admin, super_admin
 * - search: Email or name search
 * - page: Pagination page number (min 1)
 * - limit: Results per page (10-100, default 20)
 *
 * @example
 * {
 *   rol: "functionar",
 *   search: "john",
 *   page: 1,
 *   limit: 20
 * }
 */
export const staffFiltersSchema = z.object({
  rol: z.enum(["functionar", "admin", "super_admin"]).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(10).max(100).default(20),
});

export type StaffFilters = z.infer<typeof staffFiltersSchema>;

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if a role is a staff role (functionar or admin)
 */
export function isStaffRole(rol: string): rol is StaffRol {
  return rol === "functionar" || rol === "admin";
}

/**
 * Check if a role can create invitations (admin or super_admin)
 */
export function canInviteStaff(rol: string): boolean {
  return rol === "admin" || rol === "super_admin";
}

/**
 * Get Romanian label for staff role
 */
export function getStaffRoleLabel(rol: StaffRol | "super_admin"): string {
  switch (rol) {
    case "functionar":
      return "Funcționar";
    case "admin":
      return "Administrator";
    case "super_admin":
      return "Super Administrator";
    default:
      return "Necunoscut";
  }
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate invitation token format (UUID v4)
 */
export const invitationTokenSchema = z.string().uuid("Token de invitație invalid");

/**
 * Check if invitation is expired
 */
export function isInvitationExpired(expiresAt: Date): boolean {
  return new Date() > new Date(expiresAt);
}

/**
 * Calculate remaining time for invitation (in hours)
 */
export function getInvitationRemainingHours(expiresAt: Date): number {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}

/**
 * Format invitation expiration for display
 *
 * @example
 * "Expiră în 3 zile"
 * "Expiră în 12 ore"
 * "Expirat"
 */
export function formatInvitationExpiration(expiresAt: Date): string {
  const hoursRemaining = getInvitationRemainingHours(expiresAt);

  if (hoursRemaining <= 0) {
    return "Expirat";
  }

  if (hoursRemaining < 24) {
    return `Expiră în ${hoursRemaining} ${hoursRemaining === 1 ? "oră" : "ore"}`;
  }

  const daysRemaining = Math.floor(hoursRemaining / 24);
  return `Expiră în ${daysRemaining} ${daysRemaining === 1 ? "zi" : "zile"}`;
}
