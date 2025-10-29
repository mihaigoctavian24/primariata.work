import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Real-time Updates API Endpoint
 *
 * GET /api/admin/survey/realtime
 *
 * Lightweight endpoint for polling real-time survey data changes
 * Returns only changed data to minimize network traffic
 *
 * Query Parameters:
 * - since: ISO timestamp of last fetch (optional)
 * - type: 'metrics' | 'responses' | 'all' (default: 'all')
 *
 * Response:
 * {
 *   timestamp: Date;
 *   changes: {
 *     newResponses: number;
 *     updatedResponses: number;
 *     deletedResponses: number;
 *   };
 *   metrics?: { ... } // if type includes metrics
 *   responses?: [ ... ] // if type includes responses
 * }
 */

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: userData } = await authClient
      .from("utilizatori")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const since = searchParams.get("since");
    const type = searchParams.get("type") || "all";

    // Use service role client for admin operations
    const supabase = createServiceRoleClient();
    const currentTimestamp = new Date();

    // Calculate changes since last fetch
    const changes = {
      newResponses: 0,
      updatedResponses: 0,
      deletedResponses: 0,
    };

    if (since) {
      const sinceDate = new Date(since);

      // Count new responses
      const { count: newCount } = await supabase
        .from("survey_respondents")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sinceDate.toISOString());

      changes.newResponses = newCount ?? 0;

      // Count updated responses (completed_at changed)
      const { count: updatedCount } = await supabase
        .from("survey_respondents")
        .select("*", { count: "exact", head: true })
        .gte("completed_at", sinceDate.toISOString())
        .neq("created_at", "completed_at");

      changes.updatedResponses = updatedCount ?? 0;
    }

    // Build response data based on type
    const responseData: Record<string, unknown> = {
      timestamp: currentTimestamp,
      changes,
    };

    // Include metrics if requested
    if (type === "metrics" || type === "all") {
      const { count: total } = await supabase
        .from("survey_respondents")
        .select("*", { count: "exact", head: true });

      const { count: completed } = await supabase
        .from("survey_respondents")
        .select("*", { count: "exact", head: true })
        .eq("is_completed", true);

      const { count: citizens } = await supabase
        .from("survey_respondents")
        .select("*", { count: "exact", head: true })
        .eq("respondent_type", "citizen");

      const { count: officials } = await supabase
        .from("survey_respondents")
        .select("*", { count: "exact", head: true })
        .eq("respondent_type", "official");

      responseData.metrics = {
        total: total ?? 0,
        completed: completed ?? 0,
        citizens: citizens ?? 0,
        officials: officials ?? 0,
        completionRate: total && total > 0 ? Math.round(((completed ?? 0) / total) * 100) : 0,
      };
    }

    // Include recent responses if requested
    if (type === "responses" || type === "all") {
      const { data: recentResponses } = await supabase
        .from("survey_respondents")
        .select(
          "id, first_name, last_name, email, county, locality, respondent_type, is_completed, created_at, completed_at"
        )
        .order("created_at", { ascending: false })
        .limit(20);

      responseData.recentResponses = recentResponses ?? [];
    }

    // Set cache headers for short-lived cache
    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Real-time API error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
