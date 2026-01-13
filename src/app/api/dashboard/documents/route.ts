import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dashboard/documents
 *
 * Returns recent documents for the user
 * Supports filtering by:
 * - Time range (last 7 days by default)
 * - Cerere ID (optional)
 * - Document type (optional)
 * - Status (optional)
 *
 * Query params:
 * - days: Number of days to look back (default: 7)
 * - cerere_id: Filter by specific cerere (optional)
 * - type: Filter by document type (optional)
 * - status: Filter by status (optional)
 * - limit: Max number of documents to return (default: 10)
 *
 * Response format:
 * {
 *   success: true,
 *   data: Document[]
 * }
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7", 10);
    const cerereId = searchParams.get("cerere_id");
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Build query
    let query = supabase
      .from("documente")
      .select(
        `
        id,
        nume_fisier,
        tip_document,
        storage_path,
        marime_bytes,
        created_at,
        cerere_id,
        metadata,
        este_semnat
      `
      )
      .eq("incarcat_de_id", user.id)
      .gte("created_at", dateThreshold.toISOString())
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply optional filters
    if (cerereId) {
      query = query.eq("cerere_id", cerereId);
    }

    if (type) {
      query = query.eq("tip_document", type);
    }

    const { data: documents, error: documentsError } = await query;

    if (documentsError) {
      console.error("Error fetching documents:", documentsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch documents" },
        { status: 500 }
      );
    }

    // Transform data to match frontend expected format
    const transformedDocuments = (documents || []).map((doc) => ({
      id: doc.id,
      nume: doc.nume_fisier,
      tip_document: doc.tip_document,
      file_path: doc.storage_path,
      file_size: doc.marime_bytes,
      uploaded_at: doc.created_at,
      cerere_id: doc.cerere_id,
      status: doc.este_semnat ? "semnat" : "nesemnat",
      metadata: doc.metadata,
    }));

    return NextResponse.json({
      success: true,
      data: transformedDocuments,
    });
  } catch (error) {
    console.error("Unexpected error in documents:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/dashboard/documents/:id/view
 *
 * Track document view for "recently viewed" functionality
 * (Future enhancement - not implemented yet)
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { documentId } = body;

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Document ID is required" },
        { status: 400 }
      );
    }

    // Future: Track view in metadata or separate table
    // For now, just acknowledge the request
    return NextResponse.json({
      success: true,
      message: "Document view tracked (feature pending implementation)",
    });
  } catch (error) {
    console.error("Unexpected error in POST documents:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
