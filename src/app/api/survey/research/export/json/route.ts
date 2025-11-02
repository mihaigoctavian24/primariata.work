/**
 * JSON Export API Route
 *
 * Generates comprehensive JSON export
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/survey/research/export/json
 *
 * Exports complete analysis data as formatted JSON
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.rol !== "admin" && profile.rol !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Query parameters
    const searchParams = request.nextUrl.searchParams;
    const respondentType = searchParams.get("respondent_type") as "citizen" | "official" | null;
    const includeRawData = searchParams.get("include_raw_data") === "true";

    console.log(
      `[JSON Export] User: ${user.email}, Type: ${respondentType}, Raw: ${includeRawData}`
    );

    // 3. Fetch data from Supabase

    // Fetch respondents
    let respondentsQuery = supabase
      .from("survey_respondents")
      .select("*")
      .order("created_at", { ascending: false });

    if (respondentType) {
      respondentsQuery = respondentsQuery.eq("respondent_type", respondentType);
    }

    const { data: respondents, error: respondentsError } = await respondentsQuery;

    if (respondentsError) {
      console.error("[JSON Export] Respondents error:", respondentsError);
      return NextResponse.json({ error: "Failed to fetch respondents" }, { status: 500 });
    }

    // Fetch AI insights
    let insightsQuery = supabase
      .from("survey_holistic_insights")
      .select("*")
      .order("generated_at", { ascending: false });

    if (respondentType) {
      insightsQuery = insightsQuery.eq("respondent_type", respondentType);
    }

    const { data: insights, error: insightsError } = await insightsQuery;

    if (insightsError) {
      console.error("[JSON Export] Insights error:", insightsError);
      return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
    }

    // Fetch responses if needed
    let responses = null;
    if (includeRawData) {
      const { data: responsesData } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });
      responses = responsesData;
    }

    // 4. Build export object
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: user.email,
        totalRespondents: respondents?.length || 0,
        citizenCount: respondents?.filter((r) => r.respondent_type === "citizen").length || 0,
        officialCount: respondents?.filter((r) => r.respondent_type === "official").length || 0,
        insightsCount: insights?.length || 0,
        responsesCount: responses?.length || 0,
        filters: {
          respondentType: respondentType || "all",
          includeRawData,
        },
      },
      summary: {
        counties: new Set(respondents?.map((r) => r.county) || []).size,
        localities: new Set(respondents?.map((r) => r.locality) || []).size,
        avgSentiment:
          insights && insights.length > 0
            ? (
                insights.reduce((sum, i) => sum + (i.sentiment_score || 0), 0) / insights.length
              ).toFixed(2)
            : null,
      },
      respondents: respondents || [],
      insights: insights || [],
      ...(includeRawData && { responses: responses || [] }),
    };

    // 5. Generate formatted JSON
    const jsonContent = JSON.stringify(exportData, null, 2);

    const filename = `survey-data-${new Date().toISOString().split("T")[0]}.json`;

    console.log(`[JSON Export] ✅ Generated with ${respondents?.length || 0} respondents`);

    return new NextResponse(jsonContent, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[JSON Export] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate JSON",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
