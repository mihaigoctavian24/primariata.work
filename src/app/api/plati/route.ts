import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { createPlataSchema, listPlatiQuerySchema, PlataStatus } from "@/lib/validations/plati";
import type { ApiResponse, ApiErrorResponse, PaginatedResponse, PaginationMeta } from "@/types/api";
import { ZodError } from "zod";
import { getGhiseulClient } from "@/lib/payments/ghiseul-client";
import type { PaymentInitiationRequest } from "@/lib/payments/types";

/**
 * GET /api/plati
 * List payments for the authenticated user with filters and pagination
 *
 * Query Params:
 * - page (optional): Page number (default: 1)
 * - limit (optional): Items per page (default: 20, max: 100)
 * - status (optional): Filter by status
 * - date_from (optional): Filter by creation date (ISO string)
 * - date_to (optional): Filter by creation date (ISO string)
 * - sort (optional): Sort field (created_at, updated_at, suma)
 * - order (optional): Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    let queryParams;

    try {
      queryParams = listPlatiQuerySchema.parse({
        page: searchParams.get("page") || "1",
        limit: searchParams.get("limit") || "20",
        status: searchParams.get("status") || undefined,
        date_from: searchParams.get("date_from") || undefined,
        date_to: searchParams.get("date_to") || undefined,
        sort: searchParams.get("sort") || "created_at",
        order: searchParams.get("order") || "desc",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parametri de interogare invalizi",
            details: { errors: error.format() },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }

    const { page, limit, status, date_from, date_to, sort, order } = queryParams;
    const offset = (page - 1) * limit;

    // Build base query - RLS ensures users only see their own payments
    let query = supabase.from("plati").select(
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
      `,
      { count: "exact" }
    );

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (date_from) {
      query = query.gte("created_at", date_from);
    }

    if (date_to) {
      query = query.lte("created_at", date_to);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: plati, error, count } = await query;

    if (error) {
      console.error("Database error fetching plati:", error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la încărcarea plăților",
          details: { reason: error.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      total_pages: totalPages,
    };

    const response: PaginatedResponse<unknown> = {
      success: true,
      data: {
        items: plati || [],
        pagination,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/plati:", error);
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

/**
 * POST /api/plati
 * Initiate a new payment
 *
 * Body:
 * - cerere_id: UUID of the cerere requiring payment
 * - suma: Payment amount (must match cerere valoare_plata)
 * - return_url: URL to redirect after payment completion
 *
 * Returns:
 * - plata_id: Created payment ID
 * - redirect_url: URL to payment gateway (mock or real Ghișeul.ro)
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

    // Validate request body
    let validatedData;
    try {
      validatedData = createPlataSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Date invalide",
            details: { errors: error.format() },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }

    // Verify cerere exists and belongs to user
    const { data: cerere, error: cerereError } = await supabase
      .from("cereri")
      .select("id, necesita_plata, valoare_plata, plata_efectuata, solicitant_id")
      .eq("id", validatedData.cerere_id)
      .eq("solicitant_id", user.id)
      .single();

    if (cerereError || !cerere) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CERERE_NOT_FOUND",
          message: "Cererea nu există sau nu aveți acces la ea",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Validate payment requirement
    if (!cerere.necesita_plata) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PAYMENT_NOT_REQUIRED",
          message: "Această cerere nu necesită plată",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (cerere.plata_efectuata) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "ALREADY_PAID",
          message: "Această cerere a fost deja plătită",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (validatedData.suma !== cerere.valoare_plata) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_AMOUNT",
          message: `Suma trebuie să fie ${cerere.valoare_plata} RON`,
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Get user's primarie_id from utilizatori table
    const { data: utilizator, error: utilizatorError } = await supabase
      .from("utilizatori")
      .select("primarie_id")
      .eq("id", user.id)
      .single();

    if (utilizatorError || !utilizator || !utilizator.primarie_id) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "Utilizator negăsit. Vă rugăm să selectați județul și localitatea.",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Create payment record first to get plata.id
    const { data: plata, error: plataError } = await supabase
      .from("plati")
      .insert({
        primarie_id: utilizator.primarie_id,
        cerere_id: validatedData.cerere_id,
        utilizator_id: user.id,
        suma: validatedData.suma,
        status: PlataStatus.PENDING,
      })
      .select()
      .single();

    if (plataError) {
      console.error("Database error creating plata:", plataError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la crearea plății",
          details: { reason: plataError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Construct URLs for payment gateway
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("host") || "localhost:3000";
    const baseUrl = `${protocol}://${host}`;

    const return_url = `${baseUrl}/app/plati/${plata.id}`;
    const callback_url = `${baseUrl}/api/plati/webhook`;

    // Initialize payment with Ghișeul gateway (mock or production)
    const ghiseulClient = getGhiseulClient();
    const paymentRequest: PaymentInitiationRequest = {
      cerere_id: validatedData.cerere_id,
      suma: validatedData.suma,
      return_url,
      callback_url,
      metadata: {
        plata_id: plata.id,
        utilizator_id: user.id,
        primarie_id: utilizator.primarie_id,
      },
    };

    let gatewayResponse;
    try {
      gatewayResponse = await ghiseulClient.initiatePayment(paymentRequest);
      console.log(`[Payment] Gateway response for plata ${plata.id}:`, {
        transaction_id: gatewayResponse.transaction_id,
        redirect_url: gatewayResponse.redirect_url,
      });
    } catch (error) {
      console.error("Payment gateway error:", error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "GATEWAY_ERROR",
          message: "Eroare la inițializarea plății",
          details: { reason: error instanceof Error ? error.message : "Unknown error" },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Update plata record with transaction_id from gateway
    // Use service role client to bypass RLS for system operation
    const serviceSupabase = createServiceRoleClient();
    const { error: updateError } = await serviceSupabase
      .from("plati")
      .update({ transaction_id: gatewayResponse.transaction_id })
      .eq("id", plata.id);

    if (updateError) {
      console.error("Error updating plata with transaction_id:", updateError);
      // Don't fail - payment was initiated, just log the error
    } else {
      console.log(
        `[Payment] Updated plata ${plata.id} with transaction_id: ${gatewayResponse.transaction_id}`
      );
    }

    const response: ApiResponse<{ plata_id: string; redirect_url: string }> = {
      success: true,
      data: {
        plata_id: plata.id,
        redirect_url: gatewayResponse.redirect_url,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/plati:", error);
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
