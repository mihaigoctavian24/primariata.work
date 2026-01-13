import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/dashboard/search/documents
 *
 * Search documents by:
 * - Nume (filename)
 * - Tip document (document type)
 * - Status
 *
 * Query params:
 * - q: Search query string (required)
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

    // Get search query from URL params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 }
      );
    }

    // Search documents with multiple field matching
    const { data: documents, error: documentsError } = await supabase
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
        este_semnat
      `
      )
      .eq("incarcat_de_id", user.id)
      .or(`nume_fisier.ilike.%${query}%,tip_document.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (documentsError) {
      console.error("Error searching documents:", documentsError);
      return NextResponse.json(
        { success: false, error: "Failed to search documents" },
        { status: 500 }
      );
    }

    // Transform data to match frontend expected format
    const transformedDocuments = (documents || []).map((doc) => ({
      id: doc.id,
      nume: doc.nume_fisier,
      tip_document: doc.tip_document,
      status: doc.este_semnat ? "semnat" : "nesemnat",
      file_path: doc.storage_path,
      file_size: doc.marime_bytes,
      uploaded_at: doc.created_at,
      cerere_id: doc.cerere_id,
    }));

    return NextResponse.json({
      success: true,
      data: transformedDocuments,
    });
  } catch (error) {
    console.error("Unexpected error in documents search:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
