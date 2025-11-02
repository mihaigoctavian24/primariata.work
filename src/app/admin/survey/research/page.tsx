import { createServiceRoleClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { ResearchPageClient } from "./ResearchPageClient";
import Image from "next/image";
import Link from "next/link";

/**
 * Research Analysis Dashboard
 *
 * AI-powered analysis of survey data with executive summaries,
 * demographic insights, and actionable recommendations.
 *
 * Protected route - requires admin/super_admin role
 */
export default async function ResearchAnalysisPage() {
  // Authentication check
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check user role
  const { data: userData } = await authClient
    .from("utilizatori")
    .select("rol, nume, prenume, email")
    .eq("id", user.id)
    .single();

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    await authClient.auth.signOut();
    redirect("/admin/login");
  }

  const userDisplayName =
    userData.nume && userData.prenume
      ? `${userData.prenume} ${userData.nume}`
      : userData.email || user.email || "Admin";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  // Fetch basic survey stats using service role client
  const supabase = createServiceRoleClient();

  const { count: totalResponses } = await supabase
    .from("survey_respondents")
    .select("*", { count: "exact", head: true })
    .eq("is_completed", true);

  const { count: citizenCount } = await supabase
    .from("survey_respondents")
    .select("*", { count: "exact", head: true })
    .eq("respondent_type", "citizen")
    .eq("is_completed", true);

  const { count: officialCount } = await supabase
    .from("survey_respondents")
    .select("*", { count: "exact", head: true })
    .eq("respondent_type", "official")
    .eq("is_completed", true);

  // Fetch county count
  // Fetch geographic data
  const { data: geoData } = await supabase
    .from("survey_respondents")
    .select("county, locality, created_at")
    .eq("is_completed", true);

  const uniqueCounties = new Set(geoData?.map((r) => r.county).filter(Boolean));
  const uniqueLocalities = new Set(
    geoData?.map((r) => `${r.locality}, ${r.county}`).filter(Boolean)
  );
  const countyCount = uniqueCounties.size;
  const localityCount = uniqueLocalities.size;

  // Calculate date range
  const dates =
    geoData?.map((r) => new Date(r.created_at!)).filter((d) => !isNaN(d.getTime())) || [];
  const dateRange = {
    start:
      dates.length > 0
        ? new Date(Math.min(...dates.map((d) => d.getTime()))).toISOString()
        : new Date().toISOString(),
    end:
      dates.length > 0
        ? new Date(Math.max(...dates.map((d) => d.getTime()))).toISOString()
        : new Date().toISOString(),
  };

  const total = totalResponses ?? 0;
  const citizens = citizenCount ?? 0;
  const officials = officialCount ?? 0;

  // Build location data for demographics
  const { data: locationResponses } = await supabase
    .from("survey_respondents")
    .select("county, locality, respondent_type")
    .eq("is_completed", true);

  const locationMap = (locationResponses || []).reduce(
    (acc, r) => {
      const key = `${r.locality}|${r.county}`;
      if (!acc[key]) {
        acc[key] = {
          county: r.county || "",
          locality: r.locality || "",
          count: 0,
          citizenCount: 0,
          officialCount: 0,
        };
      }
      acc[key].count++;
      if (r.respondent_type === "citizen") {
        acc[key].citizenCount++;
      } else if (r.respondent_type === "official") {
        acc[key].officialCount++;
      }
      return acc;
    },
    {} as Record<
      string,
      {
        county: string;
        locality: string;
        count: number;
        citizenCount: number;
        officialCount: number;
      }
    >
  );

  const locationData = Object.values(locationMap);

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Link
                href="/admin/survey"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-muted-foreground text-sm">/</span>
              <span className="text-sm font-medium">Research Analysis</span>
            </div>
            <h1 className="from-primary to-primary/60 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
              🔬 Analiză Cercetare
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Analiză AI avansată: insight-uri, tendințe demografice și recomandări
            </p>
          </div>

          {/* User Info */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4">
              <LogoutButton />
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
        </div>

        {/* Research Tabs with Real-time Updates */}
        <ResearchPageClient
          totalResponses={total}
          citizenCount={citizens}
          officialCount={officials}
          countyCount={countyCount}
          localityCount={localityCount}
          dateRange={dateRange}
          overallSentiment={{ score: 0, label: "neutral" }}
          keyFindings={[]}
          ageDistribution={[]}
          locationData={locationData}
        />
      </div>
    </div>
  );
}
