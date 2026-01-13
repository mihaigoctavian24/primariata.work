import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dashboard/search/plati
 *
 * Search plati (payments) by:
 * - Suma (amount)
 * - Descriere (description)
 * - Status
 * - Metoda de plata (payment method)
 *
 * Query params:
 * - q: Search query string (required)
 *
 * Response format:
 * {
 *   success: true,
 *   data: Plata[]
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

    // Search plati with multiple field matching
    const { data: plati, error: platiError } = await supabase
      .from("plati")
      .select(
        `
        id,
        suma,
        status,
        metoda_plata,
        created_at,
        updated_at,
        cerere_id
      `
      )
      .eq("utilizator_id", user.id)
      .or(`suma::text.ilike.%${query}%,status.ilike.%${query}%,metoda_plata.ilike.%${query}%`)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (platiError) {
      console.error("Error searching plati:", platiError);
      return NextResponse.json(
        { success: false, error: "Failed to search plati" },
        { status: 500 }
      );
    }

    // Transform data to match frontend expected format
    const transformedPlati = (plati || []).map((plata) => ({
      id: plata.id,
      numar_plata: plata.id.slice(0, 8).toUpperCase(), // Generate short ID
      suma: plata.suma,
      status: plata.status,
      scadenta: plata.updated_at, // Use updated_at as placeholder
      tip_plata: plata.metoda_plata || "necunoscuta",
    }));

    return NextResponse.json({
      success: true,
      data: transformedPlati,
    });
  } catch (error) {
    console.error("Unexpected error in plati search:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
