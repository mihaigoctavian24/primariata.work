import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calculateCorrelations } from "@/lib/ai/correlation-analyzer";

/**
 * GET /api/survey/research/correlations
 *
 * Fetch and analyze correlations between survey variables
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check cache first
    const { data: cached } = await supabase
      .from("survey_correlation_analysis")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      console.log(`[Correlations API] Returning cached data from ${cached.created_at}`);
      return NextResponse.json({
        correlations: cached.correlations || [],
        keyFindings: cached.key_findings || [],
        recommendations: cached.recommendations || [],
        cached: true,
        cachedAt: cached.created_at,
      });
    }

    // No cache available - calculate fresh
    console.log("[Correlations API] No cache found, calculating fresh data");

    const { data: respondents, error: respondentsError } = await supabase
      .from("survey_respondents")
      .select("*");

    if (respondentsError) {
      console.error("Error fetching respondents:", respondentsError);
      return NextResponse.json(
        { error: "Failed to fetch respondents", details: respondentsError.message },
        { status: 500 }
      );
    }

    if (!respondents || respondents.length === 0) {
      return NextResponse.json({
        correlations: [],
        keyFindings: ["Nu există suficiente răspunsuri pentru analiza corelațiilor"],
        recommendations: [],
      });
    }

    const { data: responses, error: responsesError } = await supabase
      .from("survey_responses")
      .select("*");

    if (responsesError) {
      console.error("Error fetching responses:", responsesError);
      return NextResponse.json(
        { error: "Failed to fetch responses", details: responsesError.message },
        { status: 500 }
      );
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({
        correlations: [],
        keyFindings: ["Nu există răspunsuri pentru analiza corelațiilor"],
        recommendations: [],
      });
    }

    // Calculate correlations
    console.log(
      `[Correlations API] Analyzing ${respondents.length} respondents with ${responses.length} responses`
    );

    const result = await calculateCorrelations({
      respondents,
      responses,
      includeAll: false,
    });

    console.log(
      `[Correlations API] Found ${result.correlations.length} correlations, ${result.correlations.filter((c) => c.significant).length} significant`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Correlations API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
