import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { format, subDays } from "date-fns";

/**
 * GET /api/admin/survey/stats
 * Fetch comprehensive survey statistics for the admin dashboard
 *
 * Returns:
 * - Current and previous period metrics
 * - Sparkline data for trends
 * - Historical data for charts
 * - Breakdown by category
 */
export async function GET() {
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

    // Use service role client for admin operations
    const supabase = createServiceRoleClient();

    // Calculate date ranges
    const today = new Date();
    const sevenDaysAgo = subDays(today, 7);
    const fourteenDaysAgo = subDays(today, 14);
    const thirtyDaysAgo = subDays(today, 30);

    // Fetch current period data (last 7 days)
    const { data: currentPeriodData } = await supabase
      .from("survey_respondents")
      .select("id, is_completed, respondent_type, created_at")
      .gte("created_at", sevenDaysAgo.toISOString());

    // Fetch previous period data (7-14 days ago)
    const { data: previousPeriodData } = await supabase
      .from("survey_respondents")
      .select("id, is_completed, respondent_type, created_at")
      .gte("created_at", fourteenDaysAgo.toISOString())
      .lt("created_at", sevenDaysAgo.toISOString());

    // Fetch historical data (last 30 days)
    const { data: historicalData } = await supabase
      .from("survey_respondents")
      .select("id, is_completed, respondent_type, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true });

    // Calculate current metrics
    const currentTotal = currentPeriodData?.length || 0;
    const currentCompleted = currentPeriodData?.filter((r) => r.is_completed).length || 0;
    const currentCitizens =
      currentPeriodData?.filter((r) => r.respondent_type === "citizen").length || 0;
    const currentOfficials =
      currentPeriodData?.filter((r) => r.respondent_type === "official").length || 0;

    // Calculate previous metrics
    const previousTotal = previousPeriodData?.length || 0;
    const previousCompleted = previousPeriodData?.filter((r) => r.is_completed).length || 0;
    const previousCitizens =
      previousPeriodData?.filter((r) => r.respondent_type === "citizen").length || 0;
    const previousOfficials =
      previousPeriodData?.filter((r) => r.respondent_type === "official").length || 0;

    // Calculate completion rates
    const currentCompletionRate = currentTotal > 0 ? (currentCompleted / currentTotal) * 100 : 0;
    const previousCompletionRate =
      previousTotal > 0 ? (previousCompleted / previousTotal) * 100 : 0;

    // Generate sparkline data (last 7 days, daily)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateSparkline = (filterFn?: (r: any) => boolean) => {
      const sparklineMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        sparklineMap.set(format(date, "yyyy-MM-dd"), 0);
      }

      (currentPeriodData || []).filter(filterFn || (() => true)).forEach((r) => {
        if (!r.created_at) return;
        const date = format(new Date(r.created_at), "yyyy-MM-dd");
        if (sparklineMap.has(date)) {
          sparklineMap.set(date, (sparklineMap.get(date) || 0) + 1);
        }
      });

      return Array.from(sparklineMap.entries()).map(([date, value]) => ({
        value,
        label: format(new Date(date), "MMM dd"),
      }));
    };

    // Generate historical data (last 30 days, daily)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generateHistorical = (filterFn?: (r: any) => boolean) => {
      const historicalMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const date = subDays(today, i);
        historicalMap.set(format(date, "yyyy-MM-dd"), 0);
      }

      (historicalData || []).filter(filterFn || (() => true)).forEach((r) => {
        if (!r.created_at) return;
        const date = format(new Date(r.created_at), "yyyy-MM-dd");
        if (historicalMap.has(date)) {
          historicalMap.set(date, (historicalMap.get(date) || 0) + 1);
        }
      });

      return Array.from(historicalMap.entries()).map(([date, value]) => ({
        date: format(new Date(date), "MMM dd"),
        value,
      }));
    };

    // Determine trends
    const getTrend = (current: number, previous: number): "up" | "down" | "stable" => {
      if (previous === 0) return current > 0 ? "up" : "stable";
      const change = ((current - previous) / previous) * 100;
      if (Math.abs(change) < 5) return "stable";
      return change > 0 ? "up" : "down";
    };

    // Construct response
    const response = {
      totalResponses: {
        current: currentTotal,
        previous: previousTotal,
        trend: getTrend(currentTotal, previousTotal),
        sparklineData: generateSparkline(),
        historicalData: generateHistorical(),
        breakdown: [
          {
            name: "Cetățeni",
            value: currentCitizens,
            percentage: currentTotal > 0 ? (currentCitizens / currentTotal) * 100 : 0,
          },
          {
            name: "Funcționari",
            value: currentOfficials,
            percentage: currentTotal > 0 ? (currentOfficials / currentTotal) * 100 : 0,
          },
        ],
      },
      completedResponses: {
        current: currentCompleted,
        previous: previousCompleted,
        trend: getTrend(currentCompleted, previousCompleted),
        sparklineData: generateSparkline((r) => r.is_completed),
        historicalData: generateHistorical((r) => r.is_completed),
        breakdown: [
          {
            name: "Cetățeni - Completat",
            value:
              currentPeriodData?.filter((r) => r.is_completed && r.respondent_type === "citizen")
                .length || 0,
            percentage:
              currentCompleted > 0
                ? ((currentPeriodData?.filter(
                    (r) => r.is_completed && r.respondent_type === "citizen"
                  ).length || 0) /
                    currentCompleted) *
                  100
                : 0,
          },
          {
            name: "Funcționari - Completat",
            value:
              currentPeriodData?.filter((r) => r.is_completed && r.respondent_type === "official")
                .length || 0,
            percentage:
              currentCompleted > 0
                ? ((currentPeriodData?.filter(
                    (r) => r.is_completed && r.respondent_type === "official"
                  ).length || 0) /
                    currentCompleted) *
                  100
                : 0,
          },
        ],
      },
      citizenResponses: {
        current: currentCitizens,
        previous: previousCitizens,
        trend: getTrend(currentCitizens, previousCitizens),
        sparklineData: generateSparkline((r) => r.respondent_type === "citizen"),
        historicalData: generateHistorical((r) => r.respondent_type === "citizen"),
        breakdown: [
          {
            name: "Completat",
            value:
              currentPeriodData?.filter((r) => r.is_completed && r.respondent_type === "citizen")
                .length || 0,
            percentage:
              currentCitizens > 0
                ? ((currentPeriodData?.filter(
                    (r) => r.is_completed && r.respondent_type === "citizen"
                  ).length || 0) /
                    currentCitizens) *
                  100
                : 0,
          },
          {
            name: "Draft",
            value:
              currentPeriodData?.filter((r) => !r.is_completed && r.respondent_type === "citizen")
                .length || 0,
            percentage:
              currentCitizens > 0
                ? ((currentPeriodData?.filter(
                    (r) => !r.is_completed && r.respondent_type === "citizen"
                  ).length || 0) /
                    currentCitizens) *
                  100
                : 0,
          },
        ],
      },
      officialResponses: {
        current: currentOfficials,
        previous: previousOfficials,
        trend: getTrend(currentOfficials, previousOfficials),
        sparklineData: generateSparkline((r) => r.respondent_type === "official"),
        historicalData: generateHistorical((r) => r.respondent_type === "official"),
        breakdown: [
          {
            name: "Completat",
            value:
              currentPeriodData?.filter((r) => r.is_completed && r.respondent_type === "official")
                .length || 0,
            percentage:
              currentOfficials > 0
                ? ((currentPeriodData?.filter(
                    (r) => r.is_completed && r.respondent_type === "official"
                  ).length || 0) /
                    currentOfficials) *
                  100
                : 0,
          },
          {
            name: "Draft",
            value:
              currentPeriodData?.filter((r) => !r.is_completed && r.respondent_type === "official")
                .length || 0,
            percentage:
              currentOfficials > 0
                ? ((currentPeriodData?.filter(
                    (r) => !r.is_completed && r.respondent_type === "official"
                  ).length || 0) /
                    currentOfficials) *
                  100
                : 0,
          },
        ],
      },
      completionRate: {
        current: currentCompletionRate,
        previous: previousCompletionRate,
        trend: getTrend(currentCompletionRate, previousCompletionRate),
        sparklineData: Array.from({ length: 7 }, (_, i) => {
          const date = subDays(today, 6 - i);
          const dateStr = format(date, "yyyy-MM-dd");
          const dayData = (currentPeriodData || []).filter(
            (r) => r.created_at && format(new Date(r.created_at), "yyyy-MM-dd") === dateStr
          );
          const dayTotal = dayData.length;
          const dayCompleted = dayData.filter((r) => r.is_completed).length;
          return {
            value: dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0,
            label: format(date, "MMM dd"),
          };
        }),
        historicalData: Array.from({ length: 30 }, (_, i) => {
          const date = subDays(today, 29 - i);
          const dateStr = format(date, "yyyy-MM-dd");
          const dayData = (historicalData || []).filter(
            (r) => r.created_at && format(new Date(r.created_at), "yyyy-MM-dd") === dateStr
          );
          const dayTotal = dayData.length;
          const dayCompleted = dayData.filter((r) => r.is_completed).length;
          return {
            date: format(date, "MMM dd"),
            value: dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0,
          };
        }),
        breakdown: [
          {
            name: "Cetățeni - Rate",
            value:
              currentCitizens > 0
                ? ((currentPeriodData?.filter(
                    (r) => r.is_completed && r.respondent_type === "citizen"
                  ).length || 0) /
                    currentCitizens) *
                  100
                : 0,
            percentage: 50,
          },
          {
            name: "Funcționari - Rate",
            value:
              currentOfficials > 0
                ? ((currentPeriodData?.filter(
                    (r) => r.is_completed && r.respondent_type === "official"
                  ).length || 0) /
                    currentOfficials) *
                  100
                : 0,
            percentage: 50,
          },
        ],
      },
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching survey stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
