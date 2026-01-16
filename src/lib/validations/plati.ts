import { z } from "zod";
import { uuidSchema, amountSchema } from "./common";
import { sanitizeJsonObject } from "../security/sanitize";

/**
 * Plati (Payments) Validation Schemas
 *
 * SECURITY ENHANCEMENTS (Issue #93):
 * - Amount bounds validation (1 RON - 1M RON)
 * - Currency precision enforcement (2 decimals)
 * - Transaction ID format validation
 * - Gateway response sanitization
 * - Pagination bounds
 */

/**
 * Plata Status Enum
 * Represents the payment lifecycle state machine
 */
export const PlataStatus = {
  PENDING: "pending",
  PROCESSING: "processing",
  SUCCESS: "success",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PlataStatusType = (typeof PlataStatus)[keyof typeof PlataStatus];

/**
 * Payment Method Enum
 */
export const MetodaPlata = {
  CARD: "card",
  BANK_TRANSFER: "bank_transfer",
  CASH: "cash",
} as const;

export type MetodaPlataType = (typeof MetodaPlata)[keyof typeof MetodaPlata];

/**
 * Create Payment Validation Schema
 * Used when initiating a new payment
 *
 * SECURITY: Enhanced with amount bounds
 */
export const createPlataSchema = z.object({
  cerere_id: uuidSchema.refine((id) => id.length === 36, "ID cerere invalid"),

  // ENHANCED: Amount validation with bounds
  suma: amountSchema,
});

export type CreatePlataData = z.infer<typeof createPlataSchema>;

/**
 * Query Params for listing plati
 *
 * SECURITY: Added pagination bounds
 */
export const listPlatiQuerySchema = z.object({
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

  status: z.nativeEnum(PlataStatus).optional(),

  // ENHANCED: Date validation
  date_from: z.string().datetime({ message: "Data start invalidă" }).optional(),

  date_to: z.string().datetime({ message: "Data sfârșit invalidă" }).optional(),

  sort: z.enum(["created_at", "updated_at", "suma"]).optional().default("created_at"),

  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListPlatiQuery = z.infer<typeof listPlatiQuerySchema>;

/**
 * Webhook Payment Update Schema
 * Used when Ghișeul.ro webhook updates payment status
 *
 * SECURITY: Enhanced with transaction ID validation and sanitization
 */
export const webhookPlataUpdateSchema = z.object({
  // ENHANCED: Transaction ID format validation
  transaction_id: z
    .string()
    .trim()
    .min(1, "Transaction ID obligatoriu")
    .max(100, "Transaction ID prea lung")
    .regex(/^[a-zA-Z0-9_-]+$/, "Transaction ID invalid (doar alfanumeric, _, -)"),

  status: z.nativeEnum(PlataStatus),

  // ENHANCED: Sanitize gateway response
  gateway_response: z
    .record(z.string(), z.unknown())
    .refine(
      (data) => {
        // Limit size to prevent DoS
        const jsonString = JSON.stringify(data);
        return jsonString.length <= 50000; // 50KB max
      },
      { message: "Gateway response prea mare" }
    )
    .transform((data) => sanitizeJsonObject(data))
    .optional(),

  metoda_plata: z.nativeEnum(MetodaPlata).optional(),
});

export type WebhookPlataUpdateData = z.infer<typeof webhookPlataUpdateSchema>;

/**
 * Refund Request Schema
 *
 * SECURITY: NEW - validates refund requests
 */
export const refundPlataSchema = z.object({
  plata_id: uuidSchema,

  // Partial refund or full refund
  suma: amountSchema.optional(),

  // Refund reason
  motiv: z
    .string()
    .trim()
    .min(10, "Motivul rambursării trebuie să aibă cel puțin 10 caractere")
    .max(500, "Motivul rambursării este prea lung"),
});

export type RefundPlataData = z.infer<typeof refundPlataSchema>;

/**
 * Payment Retry Schema
 *
 * SECURITY: NEW - validates payment retry
 */
export const retryPlataSchema = z.object({
  plata_id: uuidSchema,
  metoda_plata: z.nativeEnum(MetodaPlata).optional(),
});

export type RetryPlataData = z.infer<typeof retryPlataSchema>;

/**
 * Validation helper: Check if payment can be retried
 */
export function canRetryPlata(status: PlataStatusType): boolean {
  return status === PlataStatus.FAILED;
}

/**
 * Validation helper: Check if payment is finalized
 */
export function isPlataFinalized(status: PlataStatusType): boolean {
  return status === PlataStatus.SUCCESS || status === PlataStatus.REFUNDED;
}

/**
 * Validation helper: Check if payment can be refunded
 */
export function canRefundPlata(status: PlataStatusType): boolean {
  return status === PlataStatus.SUCCESS;
}

/**
 * Validation helper: Check if payment status can transition
 *
 * SECURITY: Prevents invalid status transitions
 */
export function isValidPlataStatusTransition(from: PlataStatusType, to: PlataStatusType): boolean {
  const transitions: Record<PlataStatusType, PlataStatusType[]> = {
    [PlataStatus.PENDING]: [PlataStatus.PROCESSING, PlataStatus.FAILED],
    [PlataStatus.PROCESSING]: [PlataStatus.SUCCESS, PlataStatus.FAILED],
    [PlataStatus.SUCCESS]: [PlataStatus.REFUNDED],
    [PlataStatus.FAILED]: [PlataStatus.PENDING], // Allow retry
    [PlataStatus.REFUNDED]: [],
  };

  return transitions[from]?.includes(to) ?? false;
}

/**
 * Get Romanian label for payment status
 */
export function getPlataStatusLabel(status: PlataStatusType): string {
  const labels: Record<PlataStatusType, string> = {
    [PlataStatus.PENDING]: "În așteptare",
    [PlataStatus.PROCESSING]: "În procesare",
    [PlataStatus.SUCCESS]: "Finalizată",
    [PlataStatus.FAILED]: "Eșuată",
    [PlataStatus.REFUNDED]: "Rambursată",
  };

  return labels[status] || status;
}

/**
 * Get status badge color for UI (Tailwind classes)
 */
export function getPlataStatusColor(status: PlataStatusType): string {
  const colors: Record<PlataStatusType, string> = {
    [PlataStatus.PENDING]: "bg-yellow-100 text-yellow-800",
    [PlataStatus.PROCESSING]: "bg-blue-100 text-blue-800",
    [PlataStatus.SUCCESS]: "bg-green-100 text-green-800",
    [PlataStatus.FAILED]: "bg-red-100 text-red-800",
    [PlataStatus.REFUNDED]: "bg-purple-100 text-purple-800",
  };

  return colors[status] || "bg-gray-100 text-gray-800";
}

/**
 * Get Romanian label for payment method
 */
export function getMetodaPlataLabel(metoda: MetodaPlataType | null): string {
  if (!metoda) return "—";

  const labels: Record<MetodaPlataType, string> = {
    [MetodaPlata.CARD]: "Card bancar",
    [MetodaPlata.BANK_TRANSFER]: "Transfer bancar",
    [MetodaPlata.CASH]: "Numerar",
  };

  return labels[metoda] || metoda;
}

/**
 * Format suma for display (RON currency)
 */
export function formatSuma(suma: number): string {
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(suma);
}

/**
 * Validate payment amount is within bounds
 *
 * SECURITY: Prevents extreme amounts
 */
export function isValidPaymentAmount(amount: number): boolean {
  return amount >= 1 && amount <= 1000000 && Number.isFinite(amount);
}

/**
 * Calculate payment fee (if applicable)
 *
 * Example: 2% processing fee for card payments
 */
export function calculatePaymentFee(suma: number, metoda: MetodaPlataType): number {
  switch (metoda) {
    case MetodaPlata.CARD:
      return Math.round(suma * 0.02 * 100) / 100; // 2% fee, rounded to 2 decimals
    case MetodaPlata.BANK_TRANSFER:
      return 0; // No fee
    case MetodaPlata.CASH:
      return 0; // No fee
    default:
      return 0;
  }
}

/**
 * Calculate total amount including fee
 */
export function calculateTotalAmount(suma: number, metoda: MetodaPlataType): number {
  const fee = calculatePaymentFee(suma, metoda);
  return Math.round((suma + fee) * 100) / 100; // Round to 2 decimals
}
