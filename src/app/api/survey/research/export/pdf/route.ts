/**
 * PDF Export API Route
 *
 * Generates executive research report as PDF
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import jsPDF from "jspdf";

/**
 * GET /api/survey/research/export/pdf
 *
 * Generates PDF report with:
 * - Executive summary
 * - AI insights
 * - Question analysis
 * - Demographics
 * - Feature requests
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
      `[PDF Export] User: ${user.email}, Type: ${respondentType}, Raw: ${includeRawData}`
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
      console.error("[PDF Export] Respondents error:", respondentsError);
      return NextResponse.json({ error: "Failed to fetch respondents" }, { status: 500 });
    }

    // Fetch AI insights
    let insightsQuery = supabase
      .from("survey_holistic_insights")
      .select("*")
      .order("generated_at", { ascending: false });

    if (respondentType) {
      insightsQuery = insightsQuery.eq("survey_type", respondentType);
    }

    const { data: insights, error: insightsError } = await insightsQuery;

    if (insightsError) {
      console.error("[PDF Export] Insights error:", insightsError);
      return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
    }

    // 4. Generate PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper: Add page if needed
    const checkPageBreak = (neededSpace: number) => {
      if (yPosition + neededSpace > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper: Add text with wrap
    const addText = (text: string, fontSize: number, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", isBold ? "bold" : "normal");

      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      const lineHeight = fontSize * 0.5;

      lines.forEach((line: string) => {
        checkPageBreak(lineHeight);
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      return yPosition;
    };

    // 5. PDF Content

    // Title
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text("Raport Cercetare", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    pdf.setFontSize(16);
    pdf.text("Platformă Servicii Publice Digitale", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const dateStr = new Date().toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    pdf.text(`Generat: ${dateStr}`, pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Executive Summary
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    addText("Rezumat Executiv", 18, true);
    yPosition += 5;

    addText(`Total răspunsuri: ${respondents?.length || 0}`, 12);
    yPosition += 4;

    const citizenCount = respondents?.filter((r) => r.respondent_type === "citizen").length || 0;
    const officialCount = respondents?.filter((r) => r.respondent_type === "official").length || 0;

    addText(
      `Cetățeni: ${citizenCount} (${((citizenCount / (respondents?.length || 1)) * 100).toFixed(1)}%)`,
      12
    );
    yPosition += 4;

    addText(
      `Funcționari: ${officialCount} (${((officialCount / (respondents?.length || 1)) * 100).toFixed(1)}%)`,
      12
    );
    yPosition += 10;

    // AI Insights Summary
    if (insights && insights.length > 0) {
      checkPageBreak(20);
      addText("Insight-uri AI", 16, true);
      yPosition += 5;

      const avgSentiment =
        insights.reduce((sum, i) => sum + (i.sentiment_score || 0), 0) / insights.length;
      const sentimentLabel =
        avgSentiment > 0.3 ? "Pozitiv" : avgSentiment < -0.3 ? "Negativ" : "Neutru";

      addText(`Sentiment general: ${sentimentLabel} (${avgSentiment.toFixed(2)})`, 12);
      yPosition += 4;

      addText(`Total insight-uri generate: ${insights.length}`, 12);
      yPosition += 10;

      // Top themes
      const allThemes: Array<{ theme: string; score: number; mentions: number }> = [];
      insights.forEach((insight) => {
        const themes = insight.key_themes;
        if (themes && Array.isArray(themes)) {
          themes.forEach((themeObj) => {
            if (
              themeObj &&
              typeof themeObj === "object" &&
              "theme" in themeObj &&
              "score" in themeObj &&
              "mentions" in themeObj
            ) {
              allThemes.push(themeObj as { theme: string; score: number; mentions: number });
            }
          });
        }
      });

      if (allThemes.length > 0) {
        checkPageBreak(20);
        addText("Top 5 Teme Identificate:", 14, true);
        yPosition += 5;

        const sortedThemes = allThemes.sort((a, b) => b.mentions - a.mentions).slice(0, 5);

        sortedThemes.forEach((themeObj, index) => {
          checkPageBreak(6);
          addText(
            `${index + 1}. ${themeObj.theme} (${themeObj.mentions} mențiuni, scor: ${themeObj.score.toFixed(2)})`,
            11
          );
          yPosition += 2;
        });
      }
    }

    yPosition += 10;

    // Geographic Coverage
    checkPageBreak(20);
    addText("Acoperire Geografică", 16, true);
    yPosition += 5;

    const counties = new Set(respondents?.map((r) => r.county) || []).size;
    const localities = new Set(respondents?.map((r) => r.locality) || []).size;

    addText(`Județe: ${counties}`, 12);
    yPosition += 4;

    addText(`Localități: ${localities}`, 12);
    yPosition += 10;

    // Footer
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "italic");
    pdf.text("Generat automat de primariaTa❤️", pageWidth / 2, pageHeight - 10, {
      align: "center",
    });

    // 6. Generate blob and return
    const pdfBlob = pdf.output("blob");
    const buffer = await pdfBlob.arrayBuffer();

    const executionTime = Date.now() - startTime;
    console.log(`[PDF Export] ✅ Generated in ${executionTime}ms`);

    const filename = `research-report-${new Date().toISOString().split("T")[0]}.pdf`;

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[PDF Export] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate PDF",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
