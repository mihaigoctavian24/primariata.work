import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, FileText, CheckCircle, ArrowLeft, User } from "lucide-react";
import { SurveyCharts } from "@/components/admin/SurveyCharts";
import { ResponsesTable } from "@/components/admin/ResponsesTable";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

/**
 * Survey Admin Dashboard
 *
 * Protected route - requires authentication and admin/super_admin role
 * Displays survey analytics, responses, and export functionality
 */
export default async function SurveyAdminPage() {
  // Check authentication first with regular client
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirectTo=/admin/survey");
  }

  // Check user role from utilizatori table
  const { data: userData } = await authClient
    .from("utilizatori")
    .select("rol, nume, prenume, email")
    .eq("id", user.id)
    .single();

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    // User is authenticated but not admin - redirect to home
    redirect("/?error=unauthorized");
  }

  const userDisplayName =
    userData.nume && userData.prenume
      ? `${userData.prenume} ${userData.nume}`
      : userData.email || user.email || "Admin";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  // Use service role client for admin operations (bypasses RLS)
  const supabase = createServiceRoleClient();

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
    .eq("respondent_type", "official");

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
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              Dashboard Chestionare
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Analiză și statistici răspunsuri chestionar digitalizare
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/survey">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Înapoi la Survey
              </Button>
            </Link>
            <div className="flex items-start gap-3 border-l pl-4">
              <div className="flex flex-col items-end gap-1">
                <div className="text-right text-sm font-medium">{userDisplayName}</div>
                <div className="text-muted-foreground text-right text-xs">
                  {userData.email || user.email}
                </div>
                <Badge variant="default" className="mt-0.5">
                  {userData.rol === "super_admin" ? "Super Admin" : "Admin"}
                </Badge>
              </div>
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={userDisplayName}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex h-full w-full items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overview Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-none bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent shadow-lg shadow-blue-500/10 transition-all hover:shadow-xl hover:shadow-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Total Răspunsuri
              </CardTitle>
              <div className="rounded-full bg-blue-500/10 p-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {totalCount}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {citizensCount} cetățeni, {publicServantsCount} funcționari
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent shadow-lg shadow-green-500/10 transition-all hover:shadow-xl hover:shadow-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Completate
              </CardTitle>
              <div className="rounded-full bg-green-500/10 p-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {completedCount}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                Rată completare: {completionRate}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent shadow-lg shadow-purple-500/10 transition-all hover:shadow-xl hover:shadow-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                Cetățeni
              </CardTitle>
              <div className="rounded-full bg-purple-500/10 p-2">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {citizensCount}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {totalCount > 0 ? Math.round((citizensCount / totalCount) * 100) : 0}% din total
              </p>
            </CardContent>
          </Card>

          <Card className="border-none bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent shadow-lg shadow-orange-500/10 transition-all hover:shadow-xl hover:shadow-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">
                Funcționari
              </CardTitle>
              <div className="rounded-full bg-orange-500/10 p-2">
                <FileText className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                {publicServantsCount}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">
                {totalCount > 0 ? Math.round((publicServantsCount / totalCount) * 100) : 0}% din
                total
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
    </div>
  );
}
