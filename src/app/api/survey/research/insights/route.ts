import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/survey/research/insights
 *
 * Fetch AI insights with optional filtering and pagination
 *
 * Query params:
 * - questionId?: string - Filter by specific question
 * - respondentType?: 'citizen' | 'official' - Filter by respondent type
 * - startDate?: string - Filter by date range start (ISO 8601)
 * - endDate?: string - Filter by date range end (ISO 8601)
 * - limit?: number - Pagination limit (default: 50, max: 100)
 * - offset?: number - Pagination offset (default: 0)
 * - sortBy?: 'generated_at' | 'confidence_score' | 'total_responses' - Sort field (default: generated_at)
 * - sortOrder?: 'asc' | 'desc' - Sort order (default: desc)
 *
 * Response:
 * {
 *   success: boolean
 *   insights: AIInsight[]
 *   pagination: { limit, offset, total, hasMore }
 * }
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const questionId = searchParams.get("questionId");
    const respondentType = searchParams.get("respondentType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "generated_at";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

    // Build query
    let query = supabase.from("survey_ai_insights").select("*", { count: "exact" });

    // Apply filters
    if (questionId) {
      query = query.eq("question_id", questionId);
    }

    if (respondentType) {
      query = query.eq("respondent_type", respondentType);
    }

    if (startDate) {
      query = query.gte("generated_at", startDate);
    }

    if (endDate) {
      query = query.lte("generated_at", endDate);
    }

    // Apply sorting
    query = query.order(sortBy as never, { ascending: sortOrder === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: insights, error: queryError, count } = await query;

    if (queryError) {
      throw new Error(`Failed to fetch insights: ${queryError.message}`);
    }

    // Calculate pagination metadata
    const total = count || 0;
    const hasMore = offset + limit < total;

    return NextResponse.json(
      {
        success: true,
        insights: insights || [],
        pagination: {
          limit,
          offset,
          total,
          hasMore,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("[Insights Fetch] Error:", error);

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
 * DELETE /api/survey/research/insights
 *
 * Delete all insights (admin only) - useful for cache invalidation
 */
export async function DELETE() {
  try {
    const supabase = await createClient();

    // Authentication check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is super_admin (only super admins can delete all insights)
    const { data: profile } = await supabase
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (!profile || profile.rol !== "super_admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden - Super Admin access required" },
        { status: 403 }
      );
    }

    // Delete all insights
    const { error: deleteError } = await supabase.from("survey_ai_insights").delete().neq("id", "");

    if (deleteError) {
      throw new Error(`Failed to delete insights: ${deleteError.message}`);
    }

    // Also clear cache
    const { error: cacheError } = await supabase
      .from("survey_analysis_cache")
      .delete()
      .neq("id", "");

    if (cacheError) {
      console.error(`[Cache Clear] Warning: ${cacheError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "All insights and cache cleared successfully",
    });
  } catch (error) {
    console.error("[Insights Delete] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
