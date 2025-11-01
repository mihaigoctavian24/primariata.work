import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateQuestionInsight } from "@/lib/ai/insight-generator";
import type { SurveyRespondent, SurveyResponse, SurveyQuestion } from "@/types/survey";

/**
 * GET /api/survey/research/insights/[id]
 *
 * Fetch a specific AI insight by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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

    // Fetch insight
    const { data: insight, error: queryError } = await supabase
      .from("survey_ai_insights")
      .select("*")
      .eq("id", id)
      .single();

    if (queryError || !insight) {
      return NextResponse.json({ success: false, error: "Insight not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error("[Insight Fetch] Error:", error);

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
 * PUT /api/survey/research/insights/[id]
 *
 * Regenerate a specific AI insight
 *
 * Request body:
 * {
 *   forceRefresh?: boolean (optional - bypass cache)
 * }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

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

    // Fetch existing insight
    const { data: existingInsight, error: fetchError } = await supabase
      .from("survey_ai_insights")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existingInsight) {
      return NextResponse.json({ success: false, error: "Insight not found" }, { status: 404 });
    }

    // Fetch question data
    const { data: question, error: questionError } = await supabase
      .from("survey_questions")
      .select("*")
      .eq("id", existingInsight.question_id)
      .single();

    if (questionError || !question) {
      return NextResponse.json({ success: false, error: "Question not found" }, { status: 404 });
    }

    // Fetch respondents and responses
    const { data: respondents, error: respondentsError } = await supabase
      .from("survey_respondents")
      .select("*")
      .eq("respondent_type", existingInsight.respondent_type || "citizen")
      .order("created_at", { ascending: false });

    if (respondentsError) {
      throw new Error(`Failed to fetch respondents: ${respondentsError.message}`);
    }

    const respondentIds = (respondents as SurveyRespondent[]).map((r) => r.id);

    const { data: responses, error: responsesError } = await supabase
      .from("survey_responses")
      .select("*")
      .in("respondent_id", respondentIds)
      .order("created_at", { ascending: false });

    if (responsesError) {
      throw new Error(`Failed to fetch responses: ${responsesError.message}`);
    }

    // Regenerate insight using AI
    console.log(`[Insight Regenerate] Regenerating insight for question ${question.id}`);

    const newInsight = await generateQuestionInsight({
      questionId: question.id,
      questionText: question.question_text || "",
      questionType: question.question_type,
      respondentType: existingInsight.respondent_type as "citizen" | "official",
      totalResponses: (responses as SurveyResponse[]).length,
    });

    // Update insight in database
    const { error: updateError } = await supabase
      .from("survey_ai_insights")
      .update({
        themes: newInsight.themes as unknown as never,
        sentiment_score: newInsight.sentimentScore,
        sentiment_label: newInsight.sentimentLabel,
        key_phrases: newInsight.keyPhrases,
        feature_requests: newInsight.featureRequests as unknown as never,
        top_quotes: newInsight.topQuotes,
        ai_summary: newInsight.aiSummary,
        recommendations: newInsight.recommendations as unknown as never,
        total_responses: newInsight.totalResponses,
        model_version: newInsight.modelVersion,
        prompt_tokens: newInsight.promptTokens || 0,
        completion_tokens: newInsight.completionTokens || 0,
        confidence_score: newInsight.confidenceScore,
        generated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      throw new Error(`Failed to update insight: ${updateError.message}`);
    }

    // Invalidate cache
    const cacheKey = `analysis_${existingInsight.question_id}_${existingInsight.respondent_type}`;
    await supabase.from("survey_analysis_cache").delete().eq("cache_key", cacheKey);

    // Fetch updated insight
    const { data: updatedInsight } = await supabase
      .from("survey_ai_insights")
      .select("*")
      .eq("id", id)
      .single();

    return NextResponse.json({
      success: true,
      message: "Insight regenerated successfully",
      insight: updatedInsight,
    });
  } catch (error) {
    console.error("[Insight Regenerate] Error:", error);

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
 * DELETE /api/survey/research/insights/[id]
 *
 * Delete a specific AI insight and invalidate its cache
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Fetch insight to get cache key
    const { data: insight } = await supabase
      .from("survey_ai_insights")
      .select("question_id, respondent_type")
      .eq("id", id)
      .single();

    // Delete insight
    const { error: deleteError } = await supabase.from("survey_ai_insights").delete().eq("id", id);

    if (deleteError) {
      throw new Error(`Failed to delete insight: ${deleteError.message}`);
    }

    // Invalidate cache if insight was found
    if (insight) {
      const cacheKey = `analysis_${insight.question_id}_${insight.respondent_type}`;
      await supabase.from("survey_analysis_cache").delete().eq("cache_key", cacheKey);
    }

    return NextResponse.json({
      success: true,
      message: "Insight deleted successfully",
    });
  } catch (error) {
    console.error("[Insight Delete] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
