import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse, Judet } from "@/types/api";

/**
 * GET /api/localitati/judete
 *
 * Returns all județe (Romanian counties) sorted alphabetically by name
 *
 * @returns ApiResponse<Judet[]> - List of all județe
 *
 * @example Response
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": 1,
 *       "cod": "AB",
 *       "nume": "Alba",
 *       "slug": "alba",
 *       "nume_complet": "Județul Alba"
 *     }
 *   ]
 * }
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Query județe table, select required fields, and sort alphabetically
    const { data: judete, error } = await supabase
      .from("judete")
      .select("id, cod, nume, slug, nume_complet")
      .order("nume", { ascending: true });

    // Handle database errors
    if (error) {
      console.error("Database error fetching județe:", error);

      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la încărcarea județelor",
          details: {
            reason: error.message,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Return successful response
    const response: ApiResponse<Judet[]> = {
      success: true,
      data: judete || [],
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
    console.error("Unexpected error in GET /api/localitati/judete:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare internă de server",
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
