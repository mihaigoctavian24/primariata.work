/**
 * Excel Export API Route
 *
 * Generates comprehensive survey analysis Excel workbook
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ExcelJS from "exceljs";

/**
 * GET /api/survey/research/export/excel
 *
 * Generates Excel workbook with multiple sheets:
 * - Summary (overview stats)
 * - Respondents (demographic data)
 * - AI Insights (themes, sentiment, features)
 * - Responses (raw survey data - optional)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

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
    const includeRawData = searchParams.get("include_raw_data") === "true";

    console.log(
      `[Excel Export] User: ${user.email}, Type: ${respondentType}, Raw: ${includeRawData}`
    );

    // 3. Fetch data from Supabase

    // Fetch respondents
    let respondentsQuery = supabase
      .from("survey_respondents")
      .select("*")
      .order("created_at", { ascending: false });

    if (respondentType) {
      respondentsQuery = respondentsQuery.eq("respondent_type", respondentType);
    }

    const { data: respondents, error: respondentsError } = await respondentsQuery;

    if (respondentsError) {
      console.error("[Excel Export] Respondents error:", respondentsError);
      return NextResponse.json({ error: "Failed to fetch respondents" }, { status: 500 });
    }

    // Fetch AI insights
    let insightsQuery = supabase
      .from("survey_ai_insights")
      .select("*")
      .order("generated_at", { ascending: false });

    if (respondentType) {
      insightsQuery = insightsQuery.eq("respondent_type", respondentType);
    }

    const { data: insights, error: insightsError } = await insightsQuery;

    if (insightsError) {
      console.error("[Excel Export] Insights error:", insightsError);
      return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
    }

    // Fetch responses if needed
    let responses = null;
    if (includeRawData) {
      const { data: responsesData } = await supabase
        .from("survey_responses")
        .select("*")
        .order("created_at", { ascending: false });
      responses = responsesData;
    }

    // 4. Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "primariaTa❤️";
    workbook.created = new Date();

    // Sheet 1: Summary
    const summarySheet = workbook.addWorksheet("Rezumat");

    // Header styling
    summarySheet.getCell("A1").value = "Raport Cercetare - Servicii Publice Digitale";
    summarySheet.getCell("A1").font = { size: 16, bold: true };
    summarySheet.mergeCells("A1:D1");

    summarySheet.getCell("A2").value = `Generat: ${new Date().toLocaleDateString("ro-RO")}`;
    summarySheet.mergeCells("A2:D2");
    summarySheet.addRow([]);

    // Summary stats
    summarySheet.addRow(["Statistici Generale", "", "", ""]);
    summarySheet.getRow(4).font = { bold: true };
    summarySheet.addRow(["Total Răspunsuri", respondents?.length || 0, "", ""]);

    const citizenCount = respondents?.filter((r) => r.respondent_type === "citizen").length || 0;
    const officialCount = respondents?.filter((r) => r.respondent_type === "official").length || 0;

    summarySheet.addRow([
      "Cetățeni",
      citizenCount,
      `${((citizenCount / (respondents?.length || 1)) * 100).toFixed(1)}%`,
      "",
    ]);
    summarySheet.addRow([
      "Funcționari",
      officialCount,
      `${((officialCount / (respondents?.length || 1)) * 100).toFixed(1)}%`,
      "",
    ]);
    summarySheet.addRow([]);

    // Geographic stats
    const counties = new Set(respondents?.map((r) => r.county) || []).size;
    const localities = new Set(respondents?.map((r) => r.locality) || []).size;

    summarySheet.addRow(["Acoperire Geografică", "", "", ""]);
    summarySheet.getRow(9).font = { bold: true };
    summarySheet.addRow(["Județe", counties, "", ""]);
    summarySheet.addRow(["Localități", localities, "", ""]);

    // Set column widths
    summarySheet.columns = [{ width: 30 }, { width: 15 }, { width: 15 }, { width: 15 }];

    // Sheet 2: Respondents
    const respondentsSheet = workbook.addWorksheet("Respondenți");

    // Headers
    respondentsSheet.addRow([
      "ID",
      "Tip",
      "Județ",
      "Localitate",
      "Categorie Vârstă",
      "Data Creării",
    ]);
    respondentsSheet.getRow(1).font = { bold: true };
    respondentsSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };

    // Data
    respondents?.forEach((respondent) => {
      respondentsSheet.addRow([
        respondent.id,
        respondent.respondent_type === "citizen" ? "Cetățean" : "Funcționar",
        respondent.county,
        respondent.locality,
        respondent.age_category || "N/A",
        new Date(respondent.created_at || Date.now()).toLocaleDateString("ro-RO"),
      ]);
    });

    // Auto-fit columns
    respondentsSheet.columns.forEach((column) => {
      if (column.values) {
        const lengths = column.values.map((v) => (v ? v.toString().length : 10));
        column.width = Math.max(...lengths) + 2;
      }
    });

    // Sheet 3: AI Insights
    if (insights && insights.length > 0) {
      const insightsSheet = workbook.addWorksheet("Insight-uri AI");

      // Headers
      insightsSheet.addRow([
        "Question ID",
        "Tip Respondent",
        "Sentiment Scor",
        "Sentiment Label",
        "Total Răspunsuri",
        "Model",
        "Generat La",
      ]);
      insightsSheet.getRow(1).font = { bold: true };
      insightsSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      // Data
      insights.forEach((insight) => {
        insightsSheet.addRow([
          insight.question_id,
          insight.respondent_type === "citizen" ? "Cetățean" : "Funcționar",
          insight.sentiment_score?.toFixed(2) || "N/A",
          insight.sentiment_label || "N/A",
          insight.total_responses || 0,
          insight.model_version || "N/A",
          new Date(insight.generated_at || Date.now()).toLocaleDateString("ro-RO"),
        ]);
      });

      // Auto-fit columns
      insightsSheet.columns.forEach((column) => {
        if (column.values) {
          const lengths = column.values.map((v) => (v ? v.toString().length : 10));
          column.width = Math.max(...lengths) + 2;
        }
      });

      // Sheet 4: Themes (from insights)
      const themesSheet = workbook.addWorksheet("Teme");
      themesSheet.addRow(["Question ID", "Temă", "Scor", "Mențiuni", "Sentiment"]);
      themesSheet.getRow(1).font = { bold: true };
      themesSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      insights.forEach((insight) => {
        if (insight.themes && Array.isArray(insight.themes)) {
          insight.themes.forEach((theme) => {
            if (
              theme &&
              typeof theme === "object" &&
              "name" in theme &&
              "score" in theme &&
              "mentions" in theme
            ) {
              themesSheet.addRow([
                insight.question_id,
                (theme as { name: string }).name,
                (theme as { score: number }).score?.toFixed(2) || "N/A",
                (theme as { mentions: number }).mentions || 0,
                (theme as { sentiment?: number }).sentiment?.toFixed(2) || "N/A",
              ]);
            }
          });
        }
      });

      themesSheet.columns.forEach((column) => {
        if (column.values) {
          const lengths = column.values.map((v) => (v ? v.toString().length : 10));
          column.width = Math.max(...lengths) + 2;
        }
      });
    }

    // Sheet 5: Raw Responses (optional)
    if (includeRawData && responses && responses.length > 0) {
      const responsesSheet = workbook.addWorksheet("Răspunsuri Brute");

      responsesSheet.addRow([
        "ID",
        "Respondent ID",
        "Question ID",
        "Răspuns Text",
        "Răspuns Rating",
        "Data Creării",
      ]);
      responsesSheet.getRow(1).font = { bold: true };
      responsesSheet.getRow(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };

      responses.forEach((response) => {
        responsesSheet.addRow([
          response.id,
          response.respondent_id,
          response.question_id,
          response.answer_text || "N/A",
          response.answer_rating || "N/A",
          new Date(response.created_at || Date.now()).toLocaleDateString("ro-RO"),
        ]);
      });

      responsesSheet.columns.forEach((column) => {
        if (column.values) {
          const lengths = column.values.map((v) => (v ? v.toString().length : 10));
          column.width = Math.min(Math.max(...lengths) + 2, 50); // Max 50 width
        }
      });
    }

    // 5. Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const executionTime = Date.now() - startTime;
    console.log(`[Excel Export] ✅ Generated in ${executionTime}ms`);

    const filename = `survey-data-${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[Excel Export] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate Excel",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
