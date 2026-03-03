import { z } from "zod";
import { createSafeStringSchema, uuidSchema } from "./common";
import { CerereStatus } from "./cereri";

/**
 * Cereri Workflow Validation Schemas
 *
 * Zod schemas for workflow operations: status transitions,
 * internal notes, document requests, and resubmission.
 */

/**
 * Schema for transitioning a cerere to a new status.
 * Used by the transitionCerereStatus Server Action.
 */
export const transitionCerereSchema = z.object({
  cerere_id: uuidSchema,
  new_status: z.nativeEnum(CerereStatus),
  motiv: createSafeStringSchema({
    maxLength: 2000,
    sanitize: true,
    allowEmpty: true,
  }),
});

export type TransitionCerereData = z.infer<typeof transitionCerereSchema>;

/**
 * Schema for adding an internal note to a cerere.
 * Internal notes are visible only to staff (vizibil_cetatean = false).
 */
export const internalNoteSchema = z.object({
  cerere_id: uuidSchema,
  content: createSafeStringSchema({
    minLength: 1,
    maxLength: 5000,
    sanitize: true,
  }),
});

export type InternalNoteData = z.infer<typeof internalNoteSchema>;

/**
 * Schema for a single document request item.
 */
export const documentRequestItemSchema = z.object({
  tip: z.string().min(1, "Tipul documentului este obligatoriu"),
  denumire: z.string().min(1, "Denumirea documentului este obligatorie"),
  motiv: z.string().optional(),
});

/**
 * Schema for requesting additional documents from a citizen.
 * This transitions the cerere to info_suplimentare with structured document request details.
 */
export const documentRequestSchema = z.object({
  cerere_id: uuidSchema,
  documente_solicitate: z
    .array(documentRequestItemSchema)
    .min(1, "Cel puțin un document trebuie solicitat"),
  nota: createSafeStringSchema({
    maxLength: 2000,
    sanitize: true,
    allowEmpty: true,
  }),
});

export type DocumentRequestData = z.infer<typeof documentRequestSchema>;

/**
 * Schema for citizen resubmission after providing additional info.
 * Transitions cerere from info_suplimentare back to in_verificare.
 */
export const resubmitCerereSchema = z.object({
  cerere_id: uuidSchema,
  observatii: createSafeStringSchema({
    maxLength: 2000,
    sanitize: true,
    allowEmpty: true,
  }),
});

export type ResubmitCerereData = z.infer<typeof resubmitCerereSchema>;
