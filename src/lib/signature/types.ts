/**
 * Signature Service Types
 *
 * Type definitions for the signature service abstraction layer
 */

/**
 * Certificate validation result
 */
export interface CertificateValidation {
  valid: boolean;
  certificate_serial?: string;
  holder_name?: string;
  days_until_expiry?: number;
  is_mock?: boolean;
  reason?: string; // Reason if invalid
}

/**
 * Single signature request
 */
export interface SignatureRequest {
  document_url: string;
  cerere_id: string;
  cnp: string;
  signature_reason?: string;
}

/**
 * Single signature result
 */
export interface SignatureResult {
  success: boolean;
  signed_document_url?: string;
  transaction_id?: string;
  timestamp?: string;
  certificate_serial?: string;
  signer_name?: string;
  error?: string;
}

/**
 * Batch signature request
 */
export interface BatchSignatureRequest {
  documents: {
    document_url: string;
    cerere_id: string;
    signature_reason?: string;
  }[];
  cnp: string;
  batch_reason?: string;
}

/**
 * Individual document result in batch
 */
export interface BatchDocumentResult {
  cerere_id: string;
  signed_document_url?: string;
  transaction_id?: string;
  status: "success" | "failed";
  error?: string;
}

/**
 * Batch signature result
 */
export interface BatchSignatureResult {
  success: boolean;
  session_id?: string;
  results?: BatchDocumentResult[];
  summary?: {
    total: number;
    succeeded: number;
    failed: number;
    duration_ms: number;
  };
  error?: string;
}

/**
 * Signature verification result
 */
export interface SignatureVerification {
  success: boolean;
  transaction_id?: string;
  is_valid?: boolean;
  is_mock?: boolean;
  signature?: {
    signer_name: string;
    signer_cnp_masked: string;
    certificate_serial: string;
    timestamp: string;
    age_days: number;
    algorithm: string;
    reason: string;
  };
  certificate?: {
    status: string;
    warning: string | null;
  };
  documents?: {
    original_url: string;
    signed_url: string;
  };
  session_id?: string;
  error?: string;
}

/**
 * Certificate details
 */
export interface CertificateDetails {
  id: string;
  holder_name: string;
  cnp: string;
  email: string | null;
  phone: string | null;
  certificate_serial: string;
  certificate_type: string;
  issuer: string;
  valid_from: string;
  valid_until: string;
  status: string;
  is_mock: boolean;
  days_until_expiry: number;
}
