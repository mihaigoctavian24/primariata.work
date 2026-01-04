/**
 * Signature Service
 *
 * Abstraction layer for digital signature operations
 * Wraps the mock certSIGN API endpoints with a clean, type-safe interface
 */

import type {
  CertificateValidation,
  CertificateDetails,
  SignatureRequest,
  SignatureResult,
  BatchSignatureRequest,
  BatchSignatureResult,
  SignatureVerification,
} from "./types";

/**
 * Validate if a user has a valid certificate for signing
 *
 * @param cnp - 13-digit Romanian CNP
 * @returns Certificate validation result
 */
export async function validateCertificate(cnp: string): Promise<CertificateValidation> {
  try {
    const response = await fetch("/api/mock-certsign/certificates/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cnp }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        valid: false,
        reason: result.error?.message || "Validare eșuată",
      };
    }

    if (result.success && result.data.valid) {
      return {
        valid: true,
        certificate_serial: result.data.certificate_serial,
        holder_name: result.data.holder_name,
        days_until_expiry: result.data.days_until_expiry,
        is_mock: result.data.is_mock,
      };
    }

    return {
      valid: false,
      reason: result.data.reason || "Certificat invalid",
    };
  } catch (error) {
    console.error("Certificate validation error:", error);
    return {
      valid: false,
      reason: "Eroare de rețea la validare certificat",
    };
  }
}

/**
 * Get certificate details by CNP
 *
 * @param cnp - 13-digit Romanian CNP
 * @returns Certificate details or null if not found
 */
export async function getCertificate(cnp: string): Promise<CertificateDetails | null> {
  try {
    const response = await fetch(`/api/mock-certsign/certificates/${cnp}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();

    if (result.success && result.data.certificate) {
      const cert = result.data.certificate;
      return {
        id: cert.id,
        holder_name: cert.holder_name,
        cnp: cert.cnp,
        email: cert.email,
        phone: cert.phone,
        certificate_serial: cert.certificate_serial,
        certificate_type: cert.certificate_type,
        issuer: cert.issuer,
        valid_from: cert.valid_from,
        valid_until: cert.valid_until,
        status: cert.status,
        is_mock: cert.is_mock,
        days_until_expiry: cert.days_until_expiry,
      };
    }

    return null;
  } catch (error) {
    console.error("Get certificate error:", error);
    return null;
  }
}

/**
 * Sign a single PDF document
 *
 * @param request - Signature request with document URL, cerere ID, and signer CNP
 * @returns Signature result with signed document URL and transaction ID
 */
export async function signDocument(request: SignatureRequest): Promise<SignatureResult> {
  try {
    const response = await fetch("/api/mock-certsign/sign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_url: request.document_url,
        cerere_id: request.cerere_id,
        cnp: request.cnp,
        signature_reason: request.signature_reason,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || "Semnare eșuată",
      };
    }

    if (result.success && result.data) {
      return {
        success: true,
        signed_document_url: result.data.signed_document_url,
        transaction_id: result.data.transaction_id,
        timestamp: result.data.timestamp,
        certificate_serial: result.data.certificate_serial,
        signer_name: result.data.signer_name,
      };
    }

    return {
      success: false,
      error: "Răspuns invalid de la server",
    };
  } catch (error) {
    console.error("Sign document error:", error);
    return {
      success: false,
      error: "Eroare de rețea la semnare document",
    };
  }
}

/**
 * Sign multiple PDF documents in batch
 *
 * @param request - Batch signature request with array of documents and signer CNP
 * @returns Batch signature result with per-document results and summary
 */
export async function signDocumentsBatch(
  request: BatchSignatureRequest
): Promise<BatchSignatureResult> {
  try {
    const response = await fetch("/api/mock-certsign/sign/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documents: request.documents,
        cnp: request.cnp,
        batch_reason: request.batch_reason,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || "Semnare batch eșuată",
      };
    }

    if (result.success && result.data) {
      return {
        success: true,
        session_id: result.data.session_id,
        results: result.data.results,
        summary: result.data.summary,
      };
    }

    return {
      success: false,
      error: "Răspuns invalid de la server",
    };
  } catch (error) {
    console.error("Sign documents batch error:", error);
    return {
      success: false,
      error: "Eroare de rețea la semnare batch",
    };
  }
}

/**
 * Verify a digital signature by transaction ID
 *
 * @param transactionId - Unique signature transaction ID
 * @returns Signature verification result with validity status and details
 */
export async function verifySignature(transactionId: string): Promise<SignatureVerification> {
  try {
    const response = await fetch(`/api/mock-certsign/verify/${transactionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error?.message || "Verificare eșuată",
      };
    }

    if (result.success && result.data) {
      return {
        success: true,
        transaction_id: result.data.transaction_id,
        is_valid: result.data.is_valid,
        is_mock: result.data.is_mock,
        signature: result.data.signature,
        certificate: result.data.certificate,
        documents: result.data.documents,
        session_id: result.data.session_id,
      };
    }

    return {
      success: false,
      error: "Răspuns invalid de la server",
    };
  } catch (error) {
    console.error("Verify signature error:", error);
    return {
      success: false,
      error: "Eroare de rețea la verificare semnătură",
    };
  }
}

/**
 * Check if a signature is a mock signature
 *
 * @param transactionId - Unique signature transaction ID
 * @returns True if signature is mock, false otherwise
 */
export async function isMockSignature(transactionId: string): Promise<boolean> {
  const verification = await verifySignature(transactionId);
  return verification.success && verification.is_mock === true;
}

/**
 * Get signature age in days
 *
 * @param transactionId - Unique signature transaction ID
 * @returns Age in days or null if verification fails
 */
export async function getSignatureAge(transactionId: string): Promise<number | null> {
  const verification = await verifySignature(transactionId);
  if (verification.success && verification.signature) {
    return verification.signature.age_days;
  }
  return null;
}
