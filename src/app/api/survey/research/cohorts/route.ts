import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeCohorts } from "@/lib/ai/cohort-analyzer";

/**
 * GET /api/survey/research/cohorts
 *
 * Fetch and analyze cohorts (age, location, usage patterns)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Check cache first
    const { data: cached } = await supabase
      .from("survey_cohort_analysis")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached) {
      console.log(`[Cohorts API] Returning cached data from ${cached.created_at}`);
      return NextResponse.json({
        cohorts: cached.cohorts || [],
        metrics: cached.metrics || [],
        comparisons: cached.comparisons || [],
        summary: cached.summary || {},
        cached: true,
        cachedAt: cached.created_at,
      });
    }

    // No cache available - calculate fresh
    console.log("[Cohorts API] No cache found, calculating fresh data");

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
        cohorts: [],
        metrics: [],
        comparisons: [],
        summary: {
          totalCohorts: 0,
          largestCohort: null,
          smallestCohort: null,
          mostEngaged: null,
        },
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
        cohorts: [],
        metrics: [],
        comparisons: [],
        summary: {
          totalCohorts: 0,
          largestCohort: null,
          smallestCohort: null,
          mostEngaged: null,
        },
      });
    }

    // Analyze cohorts
    console.log(
      `[Cohorts API] Analyzing ${respondents.length} respondents with ${responses.length} responses`
    );

    const result = await analyzeCohorts({
      respondents,
      responses,
      cohortType: "all",
    });

    console.log(
      `[Cohorts API] Found ${result.cohorts.length} cohorts with ${result.comparisons.length} comparisons`
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[Cohorts API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
