import { z } from "zod";

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
 */
export const createCerereSchema = z.object({
  tip_cerere_id: z.string().uuid("ID tip cerere invalid"),
  date_formular: z.record(z.string(), z.unknown()),
  observatii_solicitant: z.string().max(1000, "Observațiile sunt prea lungi").optional(),
});

export type CreateCerereData = z.infer<typeof createCerereSchema>;

/**
 * Update Cerere Validation Schema
 * Used when updating a draft cerere (before submission)
 */
export const updateCerereSchema = z.object({
  date_formular: z.record(z.string(), z.unknown()).optional(),
  observatii_solicitant: z.string().max(1000, "Observațiile sunt prea lungi").optional(),
});

export type UpdateCerereData = z.infer<typeof updateCerereSchema>;

/**
 * Query Params for listing cereri
 */
export const listCereriQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, "Page must be a positive number"),

  limit: z
    .string()
    .optional()
    .default("20")
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0 && val <= 100, "Limit must be between 1 and 100"),

  status: z.nativeEnum(CerereStatus).optional(),

  tip_cerere_id: z.string().uuid("ID tip cerere invalid").optional(),

  sort: z
    .enum(["created_at", "updated_at", "data_termen", "numar_inregistrare"])
    .optional()
    .default("created_at"),

  order: z.enum(["asc", "desc"]).optional().default("desc"),
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
 */
export const cancelCerereSchema = z.object({
  motiv_anulare: z.string().min(10, "Motivul anulării trebuie să aibă cel puțin 10 caractere"),
});

export type CancelCerereData = z.infer<typeof cancelCerereSchema>;

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
 * Get status badge color for UI
 */
export function getCerereStatusColor(status: CerereStatusType): string {
  const colors: Record<CerereStatusType, string> = {
    [CerereStatus.DEPUSA]: "bg-blue-100 text-blue-800",
    [CerereStatus.IN_VERIFICARE]: "bg-yellow-100 text-yellow-800",
    [CerereStatus.INFO_SUPLIMENTARE]: "bg-orange-100 text-orange-800",
    [CerereStatus.IN_PROCESARE]: "bg-purple-100 text-purple-800",
    [CerereStatus.APROBATA]: "bg-green-100 text-green-800",
    [CerereStatus.RESPINSA]: "bg-red-100 text-red-800",
    [CerereStatus.ANULATA]: "bg-gray-100 text-gray-800",
    [CerereStatus.FINALIZATA]: "bg-emerald-100 text-emerald-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
}
