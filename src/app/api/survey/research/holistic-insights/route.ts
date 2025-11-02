import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/survey/research/holistic-insights
 *
 * Fetch holistic insights (strategic per-survey-type analysis)
 *
 * Query params:
 * - surveyType?: 'citizen' | 'official' (optional - fetch both if not provided)
 *
 * Response:
 * {
 *   success: boolean
 *   insights: HolisticInsight[]
 * }
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const surveyType = searchParams.get("surveyType");

    const supabase = await createClient();

    // Build query
    let query = supabase
      .from("survey_holistic_insights")
      .select("*")
      .order("generated_at", { ascending: false });

    if (surveyType) {
      query = query.eq("survey_type", surveyType);
    }

    const { data: insights, error } = await query;

    console.log("[Holistic Insights] Query result:", {
      count: insights?.length || 0,
      error: error?.message,
    });

    if (error) {
      console.error("[Holistic Insights] Fetch error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      insights: insights || [],
    });
  } catch (error) {
    console.error("[Holistic Insights] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
