import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";
import { requireAuth, requireOwnership, validateUUID } from "@/lib/auth/authorization";

/**
 * GET /api/plati/[id]
 * Get payment details including chitanță if available
 *
 * Returns:
 * - plata: Payment object
 * - chitanta (optional): Receipt object if payment succeeded
 *
 * Security:
 * - Authentication required
 * - Ownership verification: Users can only access their own payments
 * - UUID validation for route parameter
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // 1. Validate authentication
    const authError = await requireAuth(request);
    if (authError) return authError;

    const { id } = await params;

    // 2. Validate UUID format
    const uuidError = validateUUID(id, "plata_id");
    if (uuidError) return uuidError;

    const supabase = await createClient();

    // 3. Fetch payment to verify ownership
    const { data: plata, error: plataError } = await supabase
      .from("plati")
      .select(
        `
        id,
        primarie_id,
        cerere_id,
        utilizator_id,
        suma,
        status,
        metoda_plata,
        transaction_id,
        gateway_response,
        created_at,
        updated_at,
        cerere:cereri(
          id,
          numar_inregistrare,
          tip_cerere:tipuri_cereri(
            id,
            cod,
            nume
          )
        )
      `
      )
      .eq("id", id)
      .single();

    if (plataError || !plata) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PAYMENT_NOT_FOUND",
          message: "Plata nu a fost găsită",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // 4. Verify ownership explicitly (defense-in-depth beyond RLS)
    if (!plata.utilizator_id) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_PAYMENT",
          message: "Plata nu are un utilizator asociat",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const ownershipError = await requireOwnership(plata.utilizator_id, request, "plată");
    if (ownershipError) return ownershipError;

    // Fetch chitanta if payment is successful
    let chitanta = null;
    if (plata.status === "success") {
      const { data: chitantaData } = await supabase
        .from("chitante")
        .select("id, plata_id, numar_chitanta, pdf_url, data_emitere, created_at")
        .eq("plata_id", id)
        .single();

      chitanta = chitantaData || null;
    }

    const response: ApiResponse<{ plata: unknown; chitanta: unknown | null }> = {
      success: true,
      data: {
        plata,
        chitanta,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/plati/[id]:", error);
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
