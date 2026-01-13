import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dashboard/service-breakdown
 *
 * Returns cereri breakdown by service type for Service Breakdown Donut Chart
 *
 * Response format:
 * {
 *   success: true,
 *   data: {
 *     breakdown: [
 *       {
 *         tip_cerere_id: string,
 *         tip_cerere_nume: string,
 *         count: number,
 *         percentage: number,
 *         color: string
 *       }
 *     ],
 *     total: number
 *   }
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

    // Fetch all user's cereri with tip_cerere info
    const { data: cereri, error: cereriError } = await supabase
      .from("cereri")
      .select(
        `
        tip_cerere_id,
        tip_cerere:tipuri_cereri!inner(
          id,
          nume
        )
      `
      )
      .eq("solicitant_id", user.id);

    if (cereriError) {
      console.error("Error fetching service breakdown:", cereriError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch service breakdown" },
        { status: 500 }
      );
    }

    // Count by tip_cerere
    const countMap = new Map<string, ServiceBreakdownItem>();

    cereri.forEach((cerere) => {
      const tipCerere = Array.isArray(cerere.tip_cerere) ? cerere.tip_cerere[0] : cerere.tip_cerere;

      if (!tipCerere) return;

      const key = tipCerere.id;
      const existing = countMap.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        countMap.set(key, {
          tip_cerere_id: tipCerere.id,
          tip_cerere_nume: tipCerere.nume,
          count: 1,
          percentage: 0, // will calculate after
          color: "", // will assign after
        });
      }
    });

    const total = cereri.length;

    // Convert to array, calculate percentages, and assign colors
    const breakdown = Array.from(countMap.values())
      .map((item, index) => ({
        ...item,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: getColorForIndex(index),
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending

    return NextResponse.json({
      success: true,
      data: {
        breakdown,
        total,
      },
    });
  } catch (error) {
    console.error("Unexpected error in service-breakdown:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Get color for chart segment by index
 * Using Tailwind color palette for consistency
 */
function getColorForIndex(index: number): string {
  const colors = [
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#10b981", // emerald-500
    "#8b5cf6", // violet-500
    "#f43f5e", // rose-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
    "#6366f1", // indigo-500
  ];

  return colors[index % colors.length] || "#3b82f6"; // Fallback to blue-500
}

/**
 * TypeScript interface for service breakdown item
 */
interface ServiceBreakdownItem {
  tip_cerere_id: string;
  tip_cerere_nume: string;
  count: number;
  percentage: number;
  color: string;
}
