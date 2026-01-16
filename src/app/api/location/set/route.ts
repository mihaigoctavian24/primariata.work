import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";
import { withRateLimit, getSupabaseUserId } from "@/lib/middleware/rate-limit";

/**
 * POST /api/location/set
 * Set user's location (judet + localitate) and associate with primarie
 * Creates or updates utilizatori record with primarie_id
 *
 * Body:
 * - localitateId: string - The localitate ID
 *
 * Rate Limit: WRITE tier (20 requests per 15 minutes)
 */
async function handler(request: NextRequest) {
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
    const { localitateId } = body;

    if (!localitateId) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "localitateId este obligatoriu",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find primarie for this localitate
    const { data: primarie, error: primarieError } = await supabase
      .from("primarii")
      .select("id")
      .eq("localitate_id", parseInt(localitateId, 10))
      .single();

    if (primarieError || !primarie) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PRIMARIE_NOT_FOUND",
          message: "Nu s-a găsit primăria pentru această localitate",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Check if user already exists in utilizatori table
    const { data: existingUser } = await supabase
      .from("utilizatori")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingUser) {
      // Update existing user
      const { error: updateError } = await supabase
        .from("utilizatori")
        .update({ primarie_id: primarie.id })
        .eq("id", user.id);

      if (updateError) {
        console.error("Database error updating utilizator:", updateError);
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Eroare la actualizarea utilizatorului",
            details: { reason: updateError.message },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }
    } else {
      // Create new utilizatori record for OAuth users
      const { error: insertError } = await supabase.from("utilizatori").insert({
        id: user.id,
        email: user.email!,
        nume: user.user_metadata?.full_name?.split(" ")?.[1] || "",
        prenume: user.user_metadata?.full_name?.split(" ")?.[0] || "",
        primarie_id: primarie.id,
        rol: "cetatean",
      });

      if (insertError) {
        console.error("Database error creating utilizator:", insertError);
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "DATABASE_ERROR",
            message: "Eroare la crearea utilizatorului",
            details: { reason: insertError.message },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }
    }

    const response: ApiResponse<{ primarie_id: string }> = {
      success: true,
      data: { primarie_id: primarie.id },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in POST /api/location/set:", error);
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

// Export with rate limiting middleware
export const POST = withRateLimit("WRITE", handler, getSupabaseUserId);
