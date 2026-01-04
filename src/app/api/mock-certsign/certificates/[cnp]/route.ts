import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

/**
 * GET /api/mock-certsign/certificates/[cnp]
 * Get certificate details for a user by CNP
 *
 * Mock certSIGN Certificate API
 * Returns mock certificate information including validity status
 *
 * Features:
 * - Certificate lookup by CNP
 * - Status validation (active, not expired)
 * - Expiration date checking
 * - Revocation status checking
 *
 * Returns:
 * - certificate: Certificate object with holder info and validity dates
 * - status: active/expired/revoked/suspended
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ cnp: string }> }) {
  try {
    const supabase = await createClient();
    const { cnp } = await params;

    // Validate CNP format (must be exactly 13 digits)
    if (!cnp || cnp.length !== 13 || !/^\d{13}$/.test(cnp)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_CNP",
          message: "CNP invalid. CNP trebuie să conțină exact 13 cifre.",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check authentication (optional for certificate lookup, but good practice)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Autentificare necesară",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Fetch certificate by CNP (RLS ensures access control)
    const { data: certificate, error: certificateError } = await supabase
      .from("mock_certificates")
      .select(
        `
        id,
        user_name,
        cnp,
        email,
        phone,
        certificate_serial,
        certificate_type,
        issuer,
        valid_from,
        valid_until,
        status,
        is_mock,
        created_at,
        updated_at
      `
      )
      .eq("cnp", cnp)
      .single();

    if (certificateError || !certificate) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERTIFICATE_NOT_FOUND",
          message: "Nu există certificat digital pentru acest CNP",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Validate certificate status
    const now = new Date();
    const validFrom = new Date(certificate.valid_from);
    const validUntil = new Date(certificate.valid_until);

    // Check if certificate is expired
    if (certificate.status === "expired" || now > validUntil) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERTIFICATE_EXPIRED",
          message: `Certificatul digital a expirat la data de ${validUntil.toLocaleDateString("ro-RO")}`,
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if certificate is revoked
    if (certificate.status === "revoked") {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERTIFICATE_REVOKED",
          message: "Certificatul digital a fost revocat și nu poate fi folosit pentru semnare",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if certificate is suspended
    if (certificate.status === "suspended") {
      const errorResponse = {
        success: false,
        error: {
          code: "CERTIFICATE_SUSPENDED",
          message:
            "Certificatul digital este temporar suspendat și nu poate fi folosit pentru semnare",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if certificate is not yet valid
    if (now < validFrom) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERTIFICATE_NOT_YET_VALID",
          message: `Certificatul va fi valid începând cu ${validFrom.toLocaleDateString("ro-RO")}`,
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Certificate is valid - return details
    const response: ApiResponse<{ certificate: unknown }> = {
      success: true,
      data: {
        certificate: {
          id: certificate.id,
          holder_name: certificate.user_name,
          cnp: certificate.cnp,
          email: certificate.email,
          phone: certificate.phone,
          certificate_serial: certificate.certificate_serial,
          certificate_type: certificate.certificate_type,
          issuer: certificate.issuer,
          valid_from: certificate.valid_from,
          valid_until: certificate.valid_until,
          status: certificate.status,
          is_mock: certificate.is_mock,
          days_until_expiry: Math.floor(
            (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/mock-certsign/certificates/[cnp]:", error);
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
