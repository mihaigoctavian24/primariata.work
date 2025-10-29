/**
 * API endpoint for server-side export
 * Handles large datasets that might timeout on client-side
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // 60 seconds max for export

interface ExportRequestBody {
  format: "csv" | "xlsx" | "pdf" | "json";
  filters?: {
    dateRange?: {
      start: string;
      end: string;
    };
    respondentType?: "citizen" | "public_servant" | "all";
    county?: string;
    completedOnly?: boolean;
  };
  columns?: string[];
  options?: {
    includeHeaders?: boolean;
    csvDelimiter?: "," | ";" | "\t";
    includeSummary?: boolean;
  };
}

/**
 * POST /api/admin/survey/export
 * Export survey responses with advanced filtering and options
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body: ExportRequestBody = await request.json();
    const { format, filters, columns, options } = body;

    // Validate format
    if (!["csv", "xlsx", "pdf", "json"].includes(format)) {
      return NextResponse.json({ error: "Invalid export format" }, { status: 400 });
    }

    // Build query
    let query = supabase
      .from("survey_respondents")
      .select(
        `
        id,
        first_name,
        last_name,
        email,
        county,
        locality,
        respondent_type,
        is_completed,
        created_at,
        completed_at
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters) {
      // Date range filter
      if (filters.dateRange) {
        query = query
          .gte("created_at", filters.dateRange.start)
          .lte("created_at", filters.dateRange.end);
      }

      // Respondent type filter
      if (filters.respondentType && filters.respondentType !== "all") {
        query = query.eq("respondent_type", filters.respondentType);
      }

      // County filter
      if (filters.county && filters.county !== "all") {
        query = query.eq("county", filters.county);
      }

      // Completed only filter
      if (filters.completedOnly) {
        query = query.eq("is_completed", true);
      }
    }

    // Execute query
    const { data: responses, error: queryError } = await query;

    if (queryError) {
      console.error("Query error:", queryError);
      return NextResponse.json({ error: "Failed to fetch responses" }, { status: 500 });
    }

    if (!responses || responses.length === 0) {
      return NextResponse.json({ error: "No data to export" }, { status: 404 });
    }

    // Generate export based on format
    switch (format) {
      case "csv":
        return generateCSVResponse(responses, columns, options);

      case "xlsx":
        // For Excel, we'll return JSON and let client handle the export
        // as server-side Excel generation requires additional dependencies
        return NextResponse.json({
          data: responses,
          format: "xlsx",
          count: responses.length,
        });

      case "pdf":
        // For PDF, we'll return JSON and let client handle the export
        // as server-side PDF generation with charts is complex
        return NextResponse.json({
          data: responses,
          format: "pdf",
          count: responses.length,
        });

      case "json":
        return NextResponse.json({
          data: responses,
          format: "json",
          count: responses.length,
          exportedAt: new Date().toISOString(),
        });

      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Generate CSV response with streaming
 */
function generateCSVResponse(
  data: unknown[],
  columns?: string[],
  options?: { includeHeaders?: boolean; csvDelimiter?: string }
): NextResponse {
  const delimiter = options?.csvDelimiter || ",";
  const includeHeaders = options?.includeHeaders !== false;

  // Define columns
  const allColumns = [
    { key: "id", label: "ID" },
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "county", label: "County" },
    { key: "locality", label: "Locality" },
    { key: "respondent_type", label: "Type" },
    { key: "is_completed", label: "Completed" },
    { key: "created_at", label: "Created At" },
    { key: "completed_at", label: "Completed At" },
  ];

  // Filter columns if specified
  const activeColumns = columns
    ? allColumns.filter((col) => columns.includes(col.key))
    : allColumns;

  // Generate CSV content
  const rows: string[] = [];

  // Add UTF-8 BOM for Excel compatibility
  let csvContent = "\uFEFF";

  // Add headers
  if (includeHeaders) {
    rows.push(activeColumns.map((col) => escapeCSV(col.label)).join(delimiter));
  }

  // Add data rows
  for (const row of data as Record<string, unknown>[]) {
    const rowData = activeColumns.map((col) => {
      const value = row[col.key];
      return escapeCSV(value);
    });
    rows.push(rowData.join(delimiter));
  }

  csvContent += rows.join("\r\n");

  // Create response with proper headers
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv;charset=utf-8",
      "Content-Disposition": `attachment; filename="export_${new Date().toISOString().split("T")[0]}.csv"`,
      "Cache-Control": "no-cache",
    },
  });
}

/**
 * Escape CSV field
 */
function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) {
    return "";
  }

  const value = String(field);

  // Check if field needs quoting
  if (
    value.includes(",") ||
    value.includes(";") ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r")
  ) {
    // Escape quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return value;
}

/**
 * GET /api/admin/survey/export
 * Get export status or metadata (optional)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total count for export estimation
    const { count, error: countError } = await supabase
      .from("survey_respondents")
      .select("*", { count: "exact", head: true });

    if (countError) {
      return NextResponse.json({ error: "Failed to get count" }, { status: 500 });
    }

    return NextResponse.json({
      totalRecords: count,
      supportedFormats: ["csv", "xlsx", "pdf", "json"],
      maxRecords: 10000, // Limit for server-side export
      estimatedTime: Math.ceil((count || 0) / 100), // seconds
    });
  } catch (error) {
    console.error("Export metadata error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
