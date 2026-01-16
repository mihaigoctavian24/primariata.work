import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse, Localitate } from "@/types/api";
import { withRateLimit } from "@/lib/middleware/rate-limit";

/**
 * GET /api/localitati
 *
 * Public endpoint to list localities by county
 *
 * Rate Limit: PUBLIC tier (200 requests per 15 minutes)
 */
async function handler(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const judetIdParam = searchParams.get("judet_id");
    const searchQuery = searchParams.get("search");
    const tipFilter = searchParams.get("tip");

    // Validate required judet_id parameter
    if (!judetIdParam) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Parametrul judet_id este obligatoriu",
          details: {
            field: "judet_id",
            reason: "Query parameter 'judet_id' is required",
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Parse judet_id to number
    const judetId = parseInt(judetIdParam, 10);
    if (isNaN(judetId) || judetId <= 0) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Parametrul judet_id trebuie să fie un număr pozitiv",
          details: {
            field: "judet_id",
            reason: "Query parameter 'judet_id' must be a positive integer",
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const supabase = await createClient();

    // Build query with filters
    let query = supabase
      .from("localitati")
      .select("id, judet_id, nume, slug, tip, populatie, cod_siruta")
      .eq("judet_id", judetId);

    // Apply optional search filter (case-insensitive)
    if (searchQuery) {
      query = query.ilike("nume", `%${searchQuery}%`);
    }

    // Apply optional tip filter
    if (tipFilter) {
      query = query.eq("tip", tipFilter);
    }

    // Sort alphabetically by nume
    query = query.order("nume", { ascending: true });

    const { data: localitati, error } = await query;

    if (error) {
      console.error("Database error fetching localități:", error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la încărcarea localităților",
          details: { reason: error.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<Localitate[]> = {
      success: true,
      data: localitati || [],
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/localitati:", error);
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

// Export with rate limiting middleware (PUBLIC tier - no auth required)
export const GET = withRateLimit("PUBLIC", handler);
