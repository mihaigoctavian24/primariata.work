import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

/**
 * GET /api/mock-certsign/verify/[transactionId]
 * Verify a digital signature by transaction ID
 *
 * Returns comprehensive signature verification information including:
 * - Signature validity status
 * - Signer details (name, CNP masked, certificate serial)
 * - Document URLs (original and signed)
 * - Timestamp and algorithm
 * - Audit trail information
 *
 * Mock signatures will always show is_mock=true and include warnings
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const supabase = await createClient();
    const { transactionId } = await params;

    // Validate transaction ID format (MOCK-SIG-[timestamp]-[random])
    if (!transactionId || !transactionId.startsWith("MOCK-SIG-")) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_TRANSACTION_ID",
          message: "Transaction ID invalid",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch signature audit record
    const { data: signature, error: signatureError } = await supabase
      .from("signature_audit_log")
      .select(
        `
        id,
        transaction_id,
        session_id,
        cerere_id,
        primarie_id,
        signer_name,
        signer_cnp,
        certificate_serial,
        document_url,
        signed_document_url,
        timestamp,
        algorithm,
        signature_reason,
        status,
        error_message,
        is_mock,
        created_at
      `
      )
      .eq("transaction_id", transactionId)
      .single();

    if (signatureError || !signature) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "SIGNATURE_NOT_FOUND",
          message: "Nu s-a găsit semnătură cu acest transaction ID",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if signature is revoked
    if (signature.status === "revoked") {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "SIGNATURE_REVOKED",
          message: "Această semnătură a fost revocată și nu mai este validă",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if signature failed
    if (signature.status === "failed") {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "SIGNATURE_FAILED",
          message: signature.error_message || "Semnătura a eșuat la creare",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 422 });
    }

    // Fetch certificate to verify it's still valid
    const { data: certificate, error: certError } = await supabase
      .from("mock_certificates")
      .select("id, status, valid_from, valid_until, is_mock")
      .eq("certificate_serial", signature.certificate_serial)
      .single();

    // Certificate validation
    let certificateStatus = "valid";
    let certificateWarning = null;

    if (certError || !certificate) {
      certificateStatus = "unknown";
      certificateWarning = "Nu s-a putut verifica certificatul semnatarului";
    } else {
      const now = new Date();
      const validFrom = new Date(certificate.valid_from);
      const validUntil = new Date(certificate.valid_until);

      if (certificate.status === "revoked") {
        certificateStatus = "revoked";
        certificateWarning = "Certificatul semnatarului a fost revocat după semnare";
      } else if (certificate.status === "expired" || now > validUntil) {
        certificateStatus = "expired";
        certificateWarning = "Certificatul semnatarului a expirat";
      } else if (now < validFrom) {
        certificateStatus = "not_yet_valid";
        certificateWarning = "Certificatul nu era valid la momentul semnării";
      }
    }

    // Mask CNP for privacy (170****3456)
    const maskedCNP = `${signature.signer_cnp.substring(0, 3)}****${signature.signer_cnp.substring(9)}`;

    // Calculate signature age
    const signatureDate = new Date(signature.timestamp);
    const ageInDays = Math.floor((Date.now() - signatureDate.getTime()) / (1000 * 60 * 60 * 24));

    // Return verification result
    const response: ApiResponse<{
      transaction_id: string;
      is_valid: boolean;
      is_mock: boolean;
      signature: {
        signer_name: string;
        signer_cnp_masked: string;
        certificate_serial: string;
        timestamp: string;
        age_days: number;
        algorithm: string;
        reason: string;
      };
      certificate: {
        status: string;
        warning: string | null;
      };
      documents: {
        original_url: string;
        signed_url: string;
      };
      session_id?: string;
    }> = {
      success: true,
      data: {
        transaction_id: signature.transaction_id,
        is_valid: signature.status === "success" && certificateStatus === "valid",
        is_mock: signature.is_mock ?? true,
        signature: {
          signer_name: signature.signer_name,
          signer_cnp_masked: maskedCNP,
          certificate_serial: signature.certificate_serial,
          timestamp: signature.timestamp,
          age_days: ageInDays,
          algorithm: signature.algorithm || "SHA256withRSA",
          reason: signature.signature_reason || "Semnătură digitală",
        },
        certificate: {
          status: certificateStatus,
          warning: certificateWarning,
        },
        documents: {
          original_url: signature.document_url,
          signed_url: signature.signed_document_url,
        },
        ...(signature.session_id && { session_id: signature.session_id }),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600", // Cache verification results for 1 hour
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/mock-certsign/verify/[transactionId]:", error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare internă de server",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
