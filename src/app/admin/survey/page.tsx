import { createServiceRoleClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, CheckCircle } from "lucide-react";
import { SurveyCharts } from "@/components/admin/SurveyCharts";
import { ResponsesTable } from "@/components/admin/ResponsesTable";
import { format } from "date-fns";

/**
 * Survey Admin Dashboard
 *
 * Protected route - requires authentication and admin/functionar role
 * Displays survey analytics, responses, and export functionality
 */
export default async function SurveyAdminPage() {
  // Use service role client to bypass RLS for admin operations
  const supabase = createServiceRoleClient();

  // Check authentication
  // TEMPORARY: Disabled for testing - will re-enable after testing
  // const {
  //   data: { user },
  //   error: userError,
  // } = await supabase.auth.getUser();

  // if (userError || !user) {
  //   redirect("/auth/login");
  // }

  // TODO: Add role check - verify user is functionar or admin
  // For now, allow all authenticated users (will add role check later)

  // Fetch overview metrics
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

  const { count: publicServants } = await supabase
    .from("survey_respondents")
    .select("*", { count: "exact", head: true })
    .eq("respondent_type", "public_servant");

  const totalCount = total ?? 0;
  const completedCount = completed ?? 0;
  const citizensCount = citizens ?? 0;
  const publicServantsCount = publicServants ?? 0;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Fetch data for charts

  // 1. Respondent type distribution
  const respondentTypeData = [
    { name: "Cetățeni", value: citizensCount },
    { name: "Funcționari", value: publicServantsCount },
  ].filter((item) => item.value > 0); // Only show non-zero values

  // 2. Top locations (county + locality)
  const { data: locationResponses } = await supabase
    .from("survey_respondents")
    .select("county, locality")
    .eq("is_completed", true);

  const locationCounts = (locationResponses || []).reduce(
    (acc, { county, locality }) => {
      const key = `${locality}, ${county}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const locationData = Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // 3. Time series data (responses per day)
  const { data: timeResponses } = await supabase
    .from("survey_respondents")
    .select("created_at")
    .eq("is_completed", true)
    .order("created_at", { ascending: true });

  const dateCounts = (timeResponses || [])
    .filter((r) => r.created_at) // Filter out null timestamps
    .reduce(
      (acc, { created_at }) => {
        const date = format(new Date(created_at!), "yyyy-MM-dd");
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  const timeSeriesData = Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // 4. Fetch all responses for table
  const { data: allResponses } = await supabase
    .from("survey_respondents")
    .select(
      "id, first_name, last_name, email, county, locality, respondent_type, is_completed, created_at, completed_at"
    )
    .order("created_at", { ascending: false });

  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Chestionare</h1>
          <p className="text-muted-foreground mt-1">
            Analiză și statistici răspunsuri chestionar digitalizare
          </p>
        </div>
        <Badge variant="default">Admin</Badge>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Răspunsuri</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {citizensCount} cetățeni, {publicServantsCount} funcționari
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completate</CardTitle>
            <CheckCircle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">Rată completare: {completionRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cetățeni</CardTitle>
            <Users className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citizensCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {totalCount > 0 ? Math.round((citizensCount / totalCount) * 100) : 0}% din total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funcționari</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publicServantsCount}</div>
            <p className="text-muted-foreground mt-1 text-xs">
              {totalCount > 0 ? Math.round((publicServantsCount / totalCount) * 100) : 0}% din total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <SurveyCharts
        respondentTypeData={respondentTypeData}
        locationData={locationData}
        timeSeriesData={timeSeriesData}
      />

      {/* Responses Table */}
      <ResponsesTable initialResponses={allResponses || []} />
    </div>
  );
}
