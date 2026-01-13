import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dashboard/search/cereri
 *
 * Search cereri (requests) by:
 * - Numar cerere (request number)
 * - Tip cerere (request type)
 * - Status
 *
 * Query params:
 * - q: Search query string (required)
 *
 * Response format:
 * {
 *   success: true,
 *   data: Cerere[]
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search cereri with multiple field matching
    const { data: cereri, error: cereriError } = await supabase
      .from("cereri")
      .select(
        `
        id,
        numar_inregistrare,
        status,
        created_at,
        updated_at,
        tip_cerere:tipuri_cereri!inner(
          nume
        )
      `
      )
      .eq("solicitant_id", user.id)
      .or(`numar_inregistrare.ilike.%${query}%,status.ilike.%${query}%`)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (cereriError) {
      console.error("Error searching cereri:", cereriError);
      return NextResponse.json(
        { success: false, error: "Failed to search cereri" },
        { status: 500 }
      );
    }

    // Transform data to match frontend expected format
    const transformedCereri = (cereri || []).map((cerere) => ({
      id: cerere.id,
      numar_cerere: cerere.numar_inregistrare,
      tip_cerere: Array.isArray(cerere.tip_cerere)
        ? cerere.tip_cerere[0]?.nume
        : cerere.tip_cerere?.nume,
      status: cerere.status,
      data_depunere: cerere.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedCereri,
    });
  } catch (error) {
    console.error("Unexpected error in cereri search:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
