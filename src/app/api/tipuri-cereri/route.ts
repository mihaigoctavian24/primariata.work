import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse, TipCerere } from "@/types/api";

/**
 * GET /api/tipuri-cereri
 * Retrieve active request types for the user's current primărie
 *
 * Auth: Requires authenticated user with selected location
 *
 * Returns: Array of active tipuri_cereri sorted by ordine_afisare
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Trebuie să fii autentificat",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Get user's selected location from profile
    const { data: userData, error: userError } = await supabase
      .from("utilizatori")
      .select("localitate_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData?.localitate_id) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "NO_LOCATION",
          message: "Te rugăm să selectezi o localitate mai întâi",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Find primărie for user's selected location
    const { data: primarie, error: primarieError } = await supabase
      .from("primarii")
      .select("id")
      .eq("localitate_id", userData.localitate_id)
      .eq("activa", true)
      .single();

    if (primarieError || !primarie) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PRIMARIE_NOT_FOUND",
          message: "Nu există o primărie activă pentru această localitate",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Query active request types for the primărie
    const { data: tipuriCereri, error } = await supabase
      .from("tipuri_cereri")
      .select(
        `
        id,
        cod,
        nume,
        descriere,
        campuri_formular,
        documente_necesare,
        termen_legal_zile,
        necesita_taxa,
        valoare_taxa,
        departament_responsabil,
        activ,
        ordine_afisare
      `
      )
      .eq("primarie_id", primarie.id)
      .eq("activ", true)
      .order("ordine_afisare", { ascending: true })
      .order("nume", { ascending: true });

    if (error) {
      console.error("Database error fetching tipuri_cereri:", error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la încărcarea tipurilor de cereri",
          details: { reason: error.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<TipCerere[]> = {
      success: true,
      data: (tipuriCereri || []) as TipCerere[],
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Cache for 1 hour (tipuri_cereri don't change frequently)
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/tipuri-cereri:", error);
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
