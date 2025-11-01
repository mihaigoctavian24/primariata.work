import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractFeatures } from "@/lib/ai/feature-extractor";
import { analyzeDemographics } from "@/lib/ai/demographic-analyzer";
import { generateAllInsights, generateExecutiveSummary } from "@/lib/ai/insight-generator";
import type { SurveyRespondent, SurveyResponse, SurveyQuestion } from "@/types/survey";
import type { QuestionAnalysisResult } from "@/types/survey-ai";

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
    // Authentication check
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or super_admin
    const { data: profile } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.rol !== "admin" && profile.rol !== "super_admin")) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Admin access required" },
        {
          status: 403,
        }
      );
    }

    // Parse request body
    const body = await request.json();
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

    // Start analysis
    console.log(`[AI Analysis] Starting analysis for ${filteredRespondents.length} respondents`);

    // Filter questions if specific questionId requested
    const questionsToAnalyze = questionId
      ? questions?.filter((q) => q.id === questionId)
      : questions;

    // 1. Prepare QuestionAnalysisResult[] for AI processing
    const questionAnalyses: QuestionAnalysisResult[] = (questionsToAnalyze || []).map(
      (question: { id: string; question_text: string | null; question_type: string }) => {
        const questionResponses = filteredResponses.filter((r) => r.question_id === question.id);

        return {
          questionId: question.id,
          questionText: question.question_text || "",
          questionType: question.question_type as
            | "single_choice"
            | "multiple_choice"
            | "text"
            | "short_text"
            | "rating",
          respondentType: respondentType || "citizen",
          totalResponses: questionResponses.length,
          responseRate:
            filteredRespondents.length > 0
              ? (questionResponses.length / filteredRespondents.length) * 100
              : 0,
        };
      }
    );

    // Generate insights using AI
    const insights = await generateAllInsights(questionAnalyses);

    // Store insights in database
    for (const insight of insights) {
      const { error: insertError } = await supabase.from("survey_ai_insights").insert([
        {
          question_id: insight.questionId,
          respondent_type: insight.respondentType,
          themes: insight.themes as unknown as never,
          sentiment_score: insight.sentimentScore,
          sentiment_label: insight.sentimentLabel,
          key_phrases: insight.keyPhrases,
          feature_requests: insight.featureRequests as unknown as never,
          top_quotes: insight.topQuotes,
          ai_summary: insight.aiSummary,
          recommendations: insight.recommendations as unknown as never,
          total_responses: insight.totalResponses,
          model_version: insight.modelVersion,
          prompt_tokens: insight.promptTokens || 0,
          completion_tokens: insight.completionTokens || 0,
          confidence_score: insight.confidenceScore,
          generated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error(`[AI Analysis] Failed to store insight: ${insertError.message}`);
      }
    }

    // 2. Generate executive summary (only if analyzing all questions)
    let executiveSummary = null;
    if (!questionId) {
      const dateRange = {
        start: filteredRespondents[0]?.created_at || new Date().toISOString(),
        end:
          filteredRespondents[filteredRespondents.length - 1]?.created_at ||
          new Date().toISOString(),
      };

      const counties = new Set(filteredRespondents.map((r) => r.county)).size;
      const localities = new Set(filteredRespondents.map((r) => r.locality)).size;
      const avgSentiment = insights.reduce((sum, i) => sum + i.sentimentScore, 0) / insights.length;

      executiveSummary = await generateExecutiveSummary({
        totalResponses: filteredRespondents.length,
        citizenCount: filteredRespondents.filter((r) => r.respondent_type === "citizen").length,
        officialCount: filteredRespondents.filter((r) => r.respondent_type === "official").length,
        dateRange,
        counties,
        localities,
        overallSentiment: {
          overall: avgSentiment,
          label: avgSentiment > 0.3 ? "positive" : avgSentiment < -0.3 ? "negative" : "neutral",
        },
        questionAnalyses,
      });
    }

    // 3. Extract features (only if analyzing all questions)
    let features = null;
    if (!questionId) {
      features = await extractFeatures({
        respondentType: respondentType || "citizen",
        textResponses: questionAnalyses
          .filter((q) => q.questionType === "text" || q.questionType === "short_text")
          .map((q) => ({
            questionId: q.questionId,
            responses: filteredResponses
              .filter((r) => r.question_id === q.questionId && r.answer_text)
              .map((r) => r.answer_text!),
          })),
      });
    }

    // 4. Analyze demographics (only if analyzing all questions)
    let demographics = null;
    if (!questionId) {
      demographics = await analyzeDemographics({
        respondents: filteredRespondents.map((r) => ({
          id: r.id,
          ageCategory: r.age_category || undefined,
          county: r.county,
          locality: r.locality,
          respondentType: r.respondent_type as "citizen" | "official",
        })),
        responses: filteredResponses.map((r) => ({
          respondentId: r.respondent_id,
          questionId: r.question_id,
          answerText: r.answer_text || undefined,
          answerChoices: Array.isArray(r.answer_choices) ? r.answer_choices : undefined,
          answerRating: r.answer_rating || undefined,
        })),
      });
    }

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
      overall_sentiment_score: executiveSummary?.overallSentiment?.overall || null,
      overall_sentiment_label: executiveSummary?.overallSentiment?.label || null,
      key_findings: executiveSummary?.keyFindings || [],
      generated_at: new Date().toISOString(),
    });

    if (metadataError) {
      console.error(`[AI Analysis] Failed to store metadata: ${metadataError.message}`);
    }

    // Cache the result (24 hour TTL)
    const cacheKey = `analysis_${questionId || "all"}_${respondentType || "all"}`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: cacheError } = await supabase.from("survey_analysis_cache").upsert([
      {
        cache_key: cacheKey,
        result: {
          insights,
          executiveSummary,
          features,
          demographics,
          analysisId,
        } as unknown as never,
        expires_at: expiresAt,
        analysis_type: "full",
        input_hash: cacheKey,
      },
    ]);

    if (cacheError) {
      console.error(`[AI Analysis] Failed to cache result: ${cacheError.message}`);
    }

    console.log(`[AI Analysis] Analysis complete: ${insights.length} insights generated`);

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Analysis complete for ${filteredRespondents.length} respondents`,
      insights,
      executiveSummary,
      features,
      demographics,
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
