/**
 * Signature Service - Main Export
 *
 * Central export point for signature service functionality
 *
 * Usage:
 * ```typescript
 * import { signDocument, validateCertificate } from '@/lib/signature';
 * ```
 */

export * from "./types";
export * from "./signature-service";

// Re-export PDF utilities for convenience
export { addSignatureWatermark, validateSignatureOptions } from "../pdf/signature-watermark";
export type { SignatureWatermarkOptions } from "../pdf/signature-watermark";
