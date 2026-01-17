import { z } from "zod";
import { createSafeStringSchema, uuidSchema } from "./common";
import { sanitizeJsonObject } from "../security/sanitize";

/**
 * Cereri (Requests) Validation Schemas
 *
 * SECURITY ENHANCEMENTS (Issue #93):
 * - Added string length limits to prevent DoS
 * - Added XSS sanitization for user input
 * - Enhanced JSONB validation to prevent injection
 * - Added size limits for form data
 */

/**
 * Cerere Status Enum
 * Represents the state machine for cerere lifecycle
 */
export const CerereStatus = {
  DEPUSA: "depusa",
  IN_VERIFICARE: "in_verificare",
  INFO_SUPLIMENTARE: "info_suplimentare",
  IN_PROCESARE: "in_procesare",
  APROBATA: "aprobata",
  RESPINSA: "respinsa",
  ANULATA: "anulata",
  FINALIZATA: "finalizata",
} as const;

export type CerereStatusType = (typeof CerereStatus)[keyof typeof CerereStatus];

/**
 * Create Cerere Validation Schema
 * Used when creating a new cerere (draft state)
 *
 * SECURITY: Enhanced with size limits and sanitization
 */
export const createCerereSchema = z.object({
  tip_cerere_id: uuidSchema.refine((id) => id.length === 36, "ID tip cerere invalid"),

  // ENHANCED: Validate and sanitize JSONB form data
  date_formular: z
    .record(z.string(), z.unknown())
    .refine(
      (data) => {
        // Prevent DoS via extremely large objects
        const jsonString = JSON.stringify(data);
        return jsonString.length <= 100000; // 100KB max
      },
      { message: "Datele formularului sunt prea mari (max 100KB)" }
    )
    .refine(
      (data) => {
        // Prevent null bytes in keys (security)
        return !Object.keys(data).some((key) => key.includes("\0"));
      },
      { message: "Chei invalide în datele formularului" }
    )
    .refine(
      (data) => {
        // Limit number of keys (prevent DoS)
        return Object.keys(data).length <= 100;
      },
      { message: "Prea multe câmpuri în formular (max 100)" }
    )
    .transform((data) => {
      // Sanitize all string values in the JSON object
      return sanitizeJsonObject(data);
    }),

  // ENHANCED: Length limit and XSS sanitization
  observatii_solicitant: createSafeStringSchema({
    maxLength: 5000,
    sanitize: true,
    allowEmpty: true,
  }),
});

export type CreateCerereData = z.infer<typeof createCerereSchema>;

/**
 * Update Cerere Validation Schema
 * Used when updating a draft cerere (before submission)
 *
 * SECURITY: Same enhancements as createCerereSchema
 */
export const updateCerereSchema = z.object({
  date_formular: z
    .record(z.string(), z.unknown())
    .refine(
      (data) => {
        const jsonString = JSON.stringify(data);
        return jsonString.length <= 100000;
      },
      { message: "Datele formularului sunt prea mari (max 100KB)" }
    )
    .refine((data) => !Object.keys(data).some((key) => key.includes("\0")), {
      message: "Chei invalide în datele formularului",
    })
    .refine((data) => Object.keys(data).length <= 100, {
      message: "Prea multe câmpuri în formular (max 100)",
    })
    .transform((data) => sanitizeJsonObject(data))
    .optional(),

  observatii_solicitant: createSafeStringSchema({
    maxLength: 5000,
    sanitize: true,
    allowEmpty: true,
  }),
});

export type UpdateCerereData = z.infer<typeof updateCerereSchema>;

/**
 * Query Params for listing cereri
 *
 * SECURITY: Added bounds validation for pagination
 * ENHANCED (Issue #88): Added date range filtering and enhanced search
 */
export const listCereriQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 10000, "Page must be between 1 and 10000"),

  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "Limit must be between 1 and 100"),

  status: z.nativeEnum(CerereStatus).optional(),

  tip_cerere_id: uuidSchema.optional(),

  sort: z
    .enum(["created_at", "updated_at", "data_termen", "numar_inregistrare"])
    .optional()
    .default("created_at"),

  order: z.enum(["asc", "desc"]).optional().default("desc"),

  // ENHANCED: Search query with length limit and sanitization
  // Searches in: numar_inregistrare, titlu (from date_formular)
  search: createSafeStringSchema({
    maxLength: 200,
    sanitize: true,
    allowEmpty: true,
  }),

  // ENHANCED (Issue #88): Date range filtering
  date_from: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Data de început invalidă" }
    ),

  date_to: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "Data de sfârșit invalidă" }
    ),
});

export type ListCereriQuery = z.infer<typeof listCereriQuerySchema>;

/**
 * Submit Cerere Schema
 * Used when submitting a cerere for processing
 */
export const submitCerereSchema = z.object({
  // Optional field to confirm submission
  confirm: z.boolean().optional(),
});

export type SubmitCerereData = z.infer<typeof submitCerereSchema>;

/**
 * Cancel Cerere Schema
 * Used when cancelling a cerere
 *
 * SECURITY: Enhanced with length limits and sanitization
 */
export const cancelCerereSchema = z.object({
  motiv_anulare: createSafeStringSchema({
    minLength: 10,
    maxLength: 2000,
    sanitize: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).refine((val: any) => (val ?? "").trim().length >= 10, {
    message: "Motivul anulării trebuie să aibă cel puțin 10 caractere",
  }),
});

export type CancelCerereData = z.infer<typeof cancelCerereSchema>;

/**
 * Add Comment Schema (for officials/citizens)
 *
 * SECURITY: NEW - validates comments with XSS protection
 */
export const addCommentSchema = z.object({
  cerere_id: uuidSchema,
  content: createSafeStringSchema({
    minLength: 1,
    maxLength: 2000,
    sanitize: true,
  }),
});

export type AddCommentData = z.infer<typeof addCommentSchema>;

/**
 * Validation helper to check if cerere can be modified
 */
export function canModifyCerere(status: CerereStatusType): boolean {
  return status === CerereStatus.DEPUSA || status === CerereStatus.INFO_SUPLIMENTARE;
}

/**
 * Validation helper to check if cerere can be cancelled
 */
export function canCancelCerere(status: CerereStatusType): boolean {
  return (
    status !== CerereStatus.ANULATA &&
    status !== CerereStatus.FINALIZATA &&
    status !== CerereStatus.RESPINSA
  );
}

/**
 * Validation helper to check if cerere can be submitted
 */
export function canSubmitCerere(status: CerereStatusType): boolean {
  return status === CerereStatus.DEPUSA;
}

/**
 * Get Romanian label for cerere status
 */
export function getCerereStatusLabel(status: CerereStatusType): string {
  const labels: Record<CerereStatusType, string> = {
    [CerereStatus.DEPUSA]: "Depusă",
    [CerereStatus.IN_VERIFICARE]: "În verificare",
    [CerereStatus.INFO_SUPLIMENTARE]: "Informații suplimentare",
    [CerereStatus.IN_PROCESARE]: "În procesare",
    [CerereStatus.APROBATA]: "Aprobată",
    [CerereStatus.RESPINSA]: "Respinsă",
    [CerereStatus.ANULATA]: "Anulată",
    [CerereStatus.FINALIZATA]: "Finalizată",
  };

  return labels[status] || status;
}

/**
 * Get status badge color for UI (theme-adaptive)
 * Uses bg-{color}-500/10 for subtle background in both light/dark modes
 * Uses text-{color}-700 for light mode and dark:text-{color}-400 for dark mode
 */
export function getCerereStatusColor(status: CerereStatusType): string {
  const colors: Record<CerereStatusType, string> = {
    [CerereStatus.DEPUSA]: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    [CerereStatus.IN_VERIFICARE]: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    [CerereStatus.INFO_SUPLIMENTARE]: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    [CerereStatus.IN_PROCESARE]: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    [CerereStatus.APROBATA]: "bg-green-500/10 text-green-700 dark:text-green-400",
    [CerereStatus.RESPINSA]: "bg-red-500/10 text-red-700 dark:text-red-400",
    [CerereStatus.ANULATA]: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
    [CerereStatus.FINALIZATA]: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  };

  return colors[status] || "bg-gray-500/10 text-gray-700 dark:text-gray-400";
}

/**
 * Validate cerere transition (state machine validation)
 *
 * SECURITY: Prevents invalid status transitions
 */
export function isValidStatusTransition(from: CerereStatusType, to: CerereStatusType): boolean {
  // Valid transitions map
  const transitions: Record<CerereStatusType, CerereStatusType[]> = {
    [CerereStatus.DEPUSA]: [CerereStatus.IN_VERIFICARE, CerereStatus.ANULATA],
    [CerereStatus.IN_VERIFICARE]: [
      CerereStatus.INFO_SUPLIMENTARE,
      CerereStatus.IN_PROCESARE,
      CerereStatus.RESPINSA,
      CerereStatus.ANULATA,
    ],
    [CerereStatus.INFO_SUPLIMENTARE]: [CerereStatus.IN_VERIFICARE, CerereStatus.ANULATA],
    [CerereStatus.IN_PROCESARE]: [
      CerereStatus.APROBATA,
      CerereStatus.RESPINSA,
      CerereStatus.ANULATA,
    ],
    [CerereStatus.APROBATA]: [CerereStatus.FINALIZATA],
    [CerereStatus.RESPINSA]: [],
    [CerereStatus.ANULATA]: [],
    [CerereStatus.FINALIZATA]: [],
  };

  return transitions[from]?.includes(to) ?? false;
}
