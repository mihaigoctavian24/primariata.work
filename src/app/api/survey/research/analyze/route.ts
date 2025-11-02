import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateHolisticInsights } from "@/lib/ai/insight-generator";
import { calculateCorrelations } from "@/lib/ai/correlation-analyzer";
import { analyzeCohorts } from "@/lib/ai/cohort-analyzer";
import type { SurveyRespondent, SurveyResponse } from "@/types/survey";

/**
 * POST /api/survey/research/analyze
 *
 * Triggers AI analysis for survey responses
 *
 * Request body:
 * {
 *   questionId?: string (optional - analyze all if not provided)
 *   respondentType?: 'citizen' | 'official' (optional - analyze both if not provided)
 *   forceRefresh?: boolean (optional - bypass cache)
 * }
 *
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   insights?: AIInsight[]
 *   executiveSummary?: any
 *   demographics?: any
 *   features?: any
 *   analysisId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[AI Analysis] POST request received");

    // Authentication check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[AI Analysis] Auth check:", { user: user?.id, authError: authError?.message });

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or super_admin
    const { data: profile } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();

    console.log("[AI Analysis] Profile check:", { rol: profile?.rol });

    if (!profile || (profile.rol !== "admin" && profile.rol !== "super_admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        {
          status: 403,
        }
      );
    }

    // Parse request body - handle empty body gracefully
    let body: { questionId?: string; respondentType?: string; forceRefresh?: boolean } = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text) as {
          questionId?: string;
          respondentType?: string;
          forceRefresh?: boolean;
        };
      }
      console.log("[AI Analysis] Request body:", body);
    } catch {
      console.log("[AI Analysis] No JSON body, using defaults");
    }
    const { questionId, respondentType, forceRefresh = false } = body;

    // Check cache first (unless forceRefresh)
    if (!forceRefresh) {
      const cacheKey = `analysis_${questionId || "all"}_${respondentType || "all"}`;
      const { data: cached } = await supabase
        .from("survey_analysis_cache")
        .select("*")
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (cached) {
        return NextResponse.json({
          success: true,
          message: "Analysis retrieved from cache",
          cached: true,
          ...(typeof cached.result === "object" && cached.result !== null ? cached.result : {}),
        });
      }
    }

    // Fetch survey data
    const { data: respondents, error: respondentsError } = await supabase
      .from("survey_respondents")
      .select("*")
      .order("created_at", { ascending: false });

    if (respondentsError) {
      throw new Error(`Failed to fetch respondents: ${respondentsError.message}`);
    }

    const { data: responses, error: responsesError } = await supabase
      .from("survey_responses")
      .select("*")
      .order("created_at", { ascending: false });

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    const { data: questions, error: questionsError } = await supabase
      .from("survey_questions")
      .select("*")
      .order("order_index", { ascending: true });

    console.log("[AI Analysis] Questions query result:", {
      questionsCount: questions?.length || 0,
      questionsArray: questions,
      error: questionsError,
    });

    if (questionsError) {
      throw new Error(`Failed to fetch questions: ${questionsError.message}`);
    }

    // Validation
    if (!respondents || respondents.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No respondents found",
        },
        { status: 400 }
      );
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No responses found",
        },
        { status: 400 }
      );
    }

    // Filter by respondent type if specified
    const filteredRespondents = (
      respondentType
        ? respondents?.filter((r) => r.respondent_type === respondentType)
        : respondents
    ) as SurveyRespondent[];

    const respondentIds = filteredRespondents.map((r) => r.id);
    const filteredResponses = (
      respondentType ? responses?.filter((r) => respondentIds.includes(r.respondent_id)) : responses
    ) as SurveyResponse[];

    // Start HOLISTIC analysis per survey type
    console.log(
      `[AI Analysis] Starting HOLISTIC analysis for ${filteredRespondents.length} respondents`
    );

    // Group questions by survey_type
    const citizenQuestions = questions?.filter((q) => q.survey_type === "citizen") || [];
    const officialQuestions = questions?.filter((q) => q.survey_type === "official") || [];

    console.log(
      `[AI Analysis] Questions: ${citizenQuestions.length} citizen, ${officialQuestions.length} official`
    );

    // Determine which survey types to analyze
    const surveyTypesToAnalyze: Array<"citizen" | "official"> = [];
    if (!respondentType || respondentType === "citizen") {
      if (citizenQuestions.length > 0) surveyTypesToAnalyze.push("citizen");
    }
    if (!respondentType || respondentType === "official") {
      if (officialQuestions.length > 0) surveyTypesToAnalyze.push("official");
    }

    const holisticInsights = [];

    // Generate holistic insights for each survey type
    for (const surveyType of surveyTypesToAnalyze) {
      const surveyQuestions = surveyType === "citizen" ? citizenQuestions : officialQuestions;
      const surveyRespondents = filteredRespondents.filter((r) => r.respondent_type === surveyType);

      console.log(
        `[AI Analysis] Generating holistic insights for ${surveyType}: ${surveyQuestions.length} questions, ${surveyRespondents.length} respondents`
      );

      const insight = await generateHolisticInsights({
        surveyType,
        questions: surveyQuestions.map((q) => ({
          id: q.id,
          questionText: q.question_text || "",
          questionType: q.question_type,
          questionNumber: String(q.question_number || ""),
        })),
        responses: filteredResponses
          .filter((r) => surveyQuestions.some((q) => q.id === r.question_id))
          .map((r) => ({
            questionId: r.question_id,
            answerText: r.answer_text || undefined,
            answerChoices: Array.isArray(r.answer_choices) ? r.answer_choices : undefined,
            answerRating: r.answer_rating || undefined,
          })),
        respondentCount: surveyRespondents.length,
      });

      holisticInsights.push(insight);

      // Delete old holistic insight for this survey type
      const { error: deleteError } = await supabase
        .from("survey_holistic_insights")
        .delete()
        .eq("survey_type", surveyType);

      if (deleteError) {
        console.warn(
          `[AI Analysis] Failed to delete old holistic insight for ${surveyType}: ${deleteError.message}`
        );
      } else {
        console.log(`[AI Analysis] Deleted old holistic insight for ${surveyType}`);
      }

      // Store new holistic insight
      const { error: insertError } = await supabase.from("survey_holistic_insights").insert([
        {
          survey_type: insight.surveyType,
          key_themes: insight.keyThemes as unknown as never,
          sentiment_score: insight.sentimentScore,
          sentiment_label: insight.sentimentLabel,
          recommendations: insight.recommendations as unknown as never,
          feature_requests: insight.featureRequests as unknown as never,
          ai_summary: insight.aiSummary,
          total_questions: insight.totalQuestions,
          total_responses: insight.totalResponses,
          model_version: insight.modelVersion,
          prompt_tokens: insight.promptTokens,
          completion_tokens: insight.completionTokens,
          confidence_score: insight.confidenceScore,
          generated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error(
          `[AI Analysis] Failed to store holistic insight for ${surveyType}: ${insertError.message}`
        );
      } else {
        console.log(
          `[AI Analysis] ✅ Stored holistic insight for ${surveyType}: ${insight.recommendations.length} recommendations, ${insight.featureRequests.length} features`
        );
      }
    }

    // Calculate overall sentiment from holistic insights
    const avgSentiment =
      holisticInsights.length > 0
        ? holisticInsights.reduce((sum, i) => sum + i.sentimentScore, 0) / holisticInsights.length
        : 0;

    // Prepare summary data
    const totalRecommendations = holisticInsights.reduce(
      (sum, i) => sum + i.recommendations.length,
      0
    );
    console.log(
      `[AI Analysis] Analysis complete: ${holisticInsights.length} survey types, ${totalRecommendations} total recommendations`
    );

    // Create unique analysis ID
    const analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store metadata
    const { error: metadataError } = await supabase.from("survey_research_metadata").insert({
      analysis_id: analysisId,
      total_responses: filteredRespondents.length,
      citizen_count: filteredRespondents.filter((r) => r.respondent_type === "citizen").length,
      official_count: filteredRespondents.filter((r) => r.respondent_type === "official").length,
      date_range_start:
        filteredRespondents[filteredRespondents.length - 1]?.created_at || new Date().toISOString(),
      date_range_end: filteredRespondents[0]?.created_at || new Date().toISOString(),
      county_count: new Set(filteredRespondents.map((r) => r.county)).size,
      locality_count: new Set(filteredRespondents.map((r) => r.locality)).size,
      overall_sentiment_score: avgSentiment,
      overall_sentiment_label:
        avgSentiment > 0.3 ? "positive" : avgSentiment < -0.3 ? "negative" : "neutral",
      key_findings: holisticInsights.flatMap((i) => i.keyThemes.map((t) => t.theme)),
      generated_at: new Date().toISOString(),
    });

    if (metadataError) {
      console.error(`[AI Analysis] Failed to store metadata: ${metadataError.message}`);
    }

    // Generate and cache correlations
    console.log("[AI Analysis] Generating correlation analysis...");
    try {
      const correlationResult = await calculateCorrelations({
        respondents: filteredRespondents as unknown as Parameters<
          typeof calculateCorrelations
        >[0]["respondents"],
        responses: filteredResponses as unknown as Parameters<
          typeof calculateCorrelations
        >[0]["responses"],
        includeAll: false,
      });

      // Delete old correlation analysis
      await supabase
        .from("survey_correlation_analysis")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // Insert new correlation analysis
      const { error: correlationInsertError } = await supabase
        .from("survey_correlation_analysis")
        .insert({
          survey_type: respondentType || "all",
          analysis_type: "pearson",
          correlations: correlationResult.correlations as unknown as never,
          correlation_matrix: correlationResult.matrix as unknown as never,
          key_findings: correlationResult.keyFindings as unknown as never,
          recommendations: correlationResult.recommendations as unknown as never,
          total_correlations: correlationResult.correlations.length,
          significant_correlations: correlationResult.correlations.filter((c) => c.significant)
            .length,
          respondent_count: filteredRespondents.length,
          response_count: filteredResponses.length,
        });

      if (correlationInsertError) {
        console.error(
          `[AI Analysis] Failed to store correlation analysis: ${correlationInsertError.message}`
        );
      } else {
        console.log(
          `[AI Analysis] ✅ Stored correlation analysis: ${correlationResult.correlations.length} correlations`
        );
      }
    } catch (correlationError) {
      console.error("[AI Analysis] Correlation analysis failed:", correlationError);
    }

    // Generate and cache cohorts
    console.log("[AI Analysis] Generating cohort analysis...");
    try {
      const cohortResult = await analyzeCohorts({
        respondents: filteredRespondents as unknown as Parameters<
          typeof analyzeCohorts
        >[0]["respondents"],
        responses: filteredResponses as unknown as Parameters<
          typeof analyzeCohorts
        >[0]["responses"],
        cohortType: "all",
      });

      // Delete old cohort analysis
      await supabase
        .from("survey_cohort_analysis")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      // Insert new cohort analysis
      const { error: cohortInsertError } = await supabase.from("survey_cohort_analysis").insert({
        cohort_type: "all",
        cohorts: cohortResult.cohorts as unknown as never,
        metrics: cohortResult.metrics as unknown as never,
        comparisons: cohortResult.comparisons as unknown as never,
        summary: cohortResult.summary as unknown as never,
        total_cohorts: cohortResult.cohorts.length,
        total_comparisons: cohortResult.comparisons.length,
        respondent_count: filteredRespondents.length,
        response_count: filteredResponses.length,
      });

      if (cohortInsertError) {
        console.error(
          `[AI Analysis] Failed to store cohort analysis: ${cohortInsertError.message}`
        );
      } else {
        console.log(
          `[AI Analysis] ✅ Stored cohort analysis: ${cohortResult.cohorts.length} cohorts`
        );
      }
    } catch (cohortError) {
      console.error("[AI Analysis] Cohort analysis failed:", cohortError);
    }

    // Cache the result (24 hour TTL)
    const cacheKey = `holistic_${respondentType || "all"}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: cacheError } = await supabase.from("survey_analysis_cache").upsert([
      {
        cache_key: cacheKey,
        result: {
          holisticInsights,
          analysisId,
        } as unknown as never,
        expires_at: expiresAt,
        analysis_type: "holistic",
        input_hash: cacheKey,
      },
    ]);

    if (cacheError) {
      console.error(`[AI Analysis] Failed to cache result: ${cacheError.message}`);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Holistic analysis complete: ${totalRecommendations} recommendations from ${holisticInsights.length} survey types`,
      holisticInsights,
      analysisId,
      cached: false,
    });
  } catch (error) {
    console.error("[AI Analysis] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/survey/research/analyze
 *
 * Check analysis status
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // Get latest metadata
    const { data: metadata } = await supabase
      .from("survey_research_metadata")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (!metadata) {
      return NextResponse.json({
        success: true,
        status: "no_analysis",
        message: "No analysis has been run yet",
      });
    }

    return NextResponse.json({
      success: true,
      status: "complete",
      lastAnalysis: metadata,
    });
  } catch (error) {
    console.error("[AI Analysis Status] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
