import { z } from "zod";

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
 */
export const createPlataSchema = z.object({
  cerere_id: z.string().uuid("ID cerere invalid"),
  suma: z.number().positive("Suma trebuie să fie pozitivă"),
});

export type CreatePlataData = z.infer<typeof createPlataSchema>;

/**
 * Query Params for listing plati
 */
export const listPlatiQuerySchema = z.object({
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

  status: z.nativeEnum(PlataStatus).optional(),

  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),

  sort: z.enum(["created_at", "updated_at", "suma"]).optional().default("created_at"),

  order: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type ListPlatiQuery = z.infer<typeof listPlatiQuerySchema>;

/**
 * Webhook Payment Update Schema
 * Used when Ghișeul.ro webhook updates payment status
 */
export const webhookPlataUpdateSchema = z.object({
  transaction_id: z.string().min(1, "Transaction ID obligatoriu"),
  status: z.nativeEnum(PlataStatus),
  gateway_response: z.record(z.string(), z.unknown()).optional(),
  metoda_plata: z.nativeEnum(MetodaPlata).optional(),
});

export type WebhookPlataUpdateData = z.infer<typeof webhookPlataUpdateSchema>;

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
