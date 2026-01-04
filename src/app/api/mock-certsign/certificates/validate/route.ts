import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

/**
 * POST /api/mock-certsign/certificates/validate
 * Validate if a user has a valid certificate for signing
 *
 * Request body:
 * - cnp: string (13 digits)
 *
 * Returns:
 * - valid: boolean
 * - certificate_serial: string (if valid)
 * - holder_name: string (if valid)
 * - reason: string (if invalid)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
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

    // Parse request body
    const body = await request.json();
    const { cnp } = body;

    // Validate CNP format
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

    // Fetch certificate
    const { data: certificate, error: certificateError } = await supabase
      .from("mock_certificates")
      .select("id, user_name, certificate_serial, status, valid_from, valid_until, is_mock")
      .eq("cnp", cnp)
      .single();

    // Certificate not found
    if (certificateError || !certificate) {
      const response: ApiResponse<{
        valid: boolean;
        reason: string;
      }> = {
        success: true,
        data: {
          valid: false,
          reason: "Nu există certificat digital pentru acest CNP",
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Validate certificate status
    const now = new Date();
    const validFrom = new Date(certificate.valid_from);
    const validUntil = new Date(certificate.valid_until);

    // Check various invalid states
    if (certificate.status === "expired" || now > validUntil) {
      const response: ApiResponse<{
        valid: boolean;
        reason: string;
      }> = {
        success: true,
        data: {
          valid: false,
          reason: `Certificatul a expirat la ${validUntil.toLocaleDateString("ro-RO")}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      };
      return NextResponse.json(response, { status: 200 });
    }

    if (certificate.status === "revoked") {
      const response: ApiResponse<{
        valid: boolean;
        reason: string;
      }> = {
        success: true,
        data: {
          valid: false,
          reason: "Certificatul a fost revocat",
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      };
      return NextResponse.json(response, { status: 200 });
    }

    if (certificate.status === "suspended") {
      const response: ApiResponse<{
        valid: boolean;
        reason: string;
      }> = {
        success: true,
        data: {
          valid: false,
          reason: "Certificatul este temporar suspendat",
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      };
      return NextResponse.json(response, { status: 200 });
    }

    if (now < validFrom) {
      const response: ApiResponse<{
        valid: boolean;
        reason: string;
      }> = {
        success: true,
        data: {
          valid: false,
          reason: `Certificatul va fi valid începând cu ${validFrom.toLocaleDateString("ro-RO")}`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: "1.0",
        },
      };
      return NextResponse.json(response, { status: 200 });
    }

    // Certificate is valid
    const daysUntilExpiry = Math.floor(
      (validUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const response: ApiResponse<{
      valid: boolean;
      certificate_serial: string;
      holder_name: string;
      days_until_expiry: number;
      is_mock: boolean;
    }> = {
      success: true,
      data: {
        valid: true,
        certificate_serial: certificate.certificate_serial,
        holder_name: certificate.user_name,
        days_until_expiry: daysUntilExpiry,
        is_mock: certificate.is_mock ?? true,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/mock-certsign/certificates/validate:", error);
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
