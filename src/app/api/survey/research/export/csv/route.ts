/**
 * CSV Export API Route
 *
 * Generates CSV export of survey data
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/survey/research/export/csv
 *
 * Exports respondents data as CSV with UTF-8 BOM for Excel compatibility
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

    console.log(`[CSV Export] User: ${user.email}, Type: ${respondentType}`);

    // 3. Fetch data from Supabase

    let respondentsQuery = supabase
      .from("survey_respondents")
      .select("*")
      .order("created_at", { ascending: false });

    if (respondentType) {
      respondentsQuery = respondentsQuery.eq("respondent_type", respondentType);
    }

    const { data: respondents, error: respondentsError } = await respondentsQuery;

    if (respondentsError) {
      console.error("[CSV Export] Error:", respondentsError);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }

    // 4. Generate CSV content
    const headers = [
      "ID",
      "Tip",
      "Județ",
      "Localitate",
      "Categorie Vârstă",
      "Departament",
      "Data Creării",
      "Data Completării",
    ];

    let csvContent = "\uFEFF"; // UTF-8 BOM for Excel compatibility
    csvContent += headers.join(",") + "\n";

    respondents?.forEach((respondent) => {
      const row = [
        respondent.id,
        respondent.respondent_type === "citizen" ? "Cetățean" : "Funcționar",
        respondent.county,
        respondent.locality,
        respondent.age_category || "N/A",
        respondent.department || "N/A",
        new Date(respondent.created_at || Date.now()).toLocaleDateString("ro-RO"),
        respondent.completed_at
          ? new Date(respondent.completed_at).toLocaleDateString("ro-RO")
          : "N/A",
      ];

      // Escape values that contain commas or quotes
      const escapedRow = row.map((value) => {
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });

      csvContent += escapedRow.join(",") + "\n";
    });

    const filename = `survey-responses-${new Date().toISOString().split("T")[0]}.csv`;

    console.log(`[CSV Export] ✅ Generated ${respondents?.length || 0} rows`);

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[CSV Export] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate CSV",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
