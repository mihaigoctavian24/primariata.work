import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dashboard/cereri-timeline
 *
 * Returns active cereri with progress data for Status Timeline Chart
 *
 * Response format:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: string,
 *       numar_cerere: string,
 *       tip_cerere: { nume: string },
 *       status: string,
 *       progress: {
 *         percentage: number (0-100),
 *         current_step: string,
 *         eta_days: number | null,
 *         last_activity: string | null
 *       },
 *       created_at: string,
 *       updated_at: string
 *     }
 *   ]
 * }
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
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch active cereri (not finalized, rejected, or cancelled)
    const { data: cereri, error: cereriError } = await supabase
      .from("cereri")
      .select(
        `
        id,
        numar_inregistrare,
        status,
        created_at,
        updated_at,
        progress_data,
        tip_cerere:tipuri_cereri!inner(
          nume
        )
      `
      )
      .eq("solicitant_id", user.id)
      .in("status", ["depusa", "in_verificare", "in_asteptare", "in_aprobare"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (cereriError) {
      console.error("Error fetching cereri timeline:", cereriError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch cereri timeline" },
        { status: 500 }
      );
    }

    // Transform data with progress calculation
    const timeline = (cereri || []).map((cerere) => {
      // Extract progress data or calculate default
      const progressData = (cerere.progress_data as Record<string, unknown>) || {};
      const percentage = (progressData.percentage as number) || calculateProgress(cerere.status);

      // Calculate ETA based on status (rough estimates)
      const etaDays = calculateETA(cerere.status, cerere.created_at || new Date().toISOString());

      return {
        id: cerere.id,
        numar_cerere: cerere.numar_inregistrare,
        tip_cerere: Array.isArray(cerere.tip_cerere) ? cerere.tip_cerere[0] : cerere.tip_cerere,
        status: cerere.status,
        progress: {
          percentage,
          current_step: cerere.status,
          eta_days: etaDays,
          last_activity: cerere.updated_at,
        },
        created_at: cerere.created_at,
        updated_at: cerere.updated_at,
      };
    });

    return NextResponse.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.error("Unexpected error in cereri-timeline:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Calculate progress percentage based on status
 */
function calculateProgress(status: string): number {
  const progressMap: Record<string, number> = {
    draft: 0,
    depusa: 25,
    in_verificare: 40,
    in_asteptare: 50,
    in_aprobare: 75,
    aprobat: 100,
    respins: 100,
    anulat: 100,
  };
  return progressMap[status] || 0;
}

/**
 * Calculate estimated days remaining based on status and creation date
 */
function calculateETA(status: string, createdAt: string): number | null {
  // Average processing times per status (in days)
  const processingTimes: Record<string, number> = {
    depusa: 12,
    in_verificare: 8,
    in_asteptare: 5,
    in_aprobare: 3,
  };

  const baseTime = processingTimes[status];
  if (!baseTime) return null;

  // Calculate days since creation
  const created = new Date(createdAt);
  const now = new Date();
  const daysPassed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

  // Remaining days = base time - days passed (minimum 1 day)
  const remaining = Math.max(1, baseTime - daysPassed);

  return remaining;
}
