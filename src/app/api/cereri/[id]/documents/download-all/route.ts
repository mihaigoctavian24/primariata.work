import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiErrorResponse } from "@/types/api";
import JSZip from "jszip";

/**
 * GET /api/cereri/[id]/documents/download-all
 * Download all documents for a cerere as a ZIP file
 *
 * Auth: Requires authenticated user who owns the cerere
 *
 * Returns: ZIP file stream
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: cerereId } = await params;

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Trebuie să fii autentificat",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify cerere ownership
    const { data: cerere, error: cerereError } = await supabase
      .from("cereri")
      .select("id, solicitant_id, numar_inregistrare")
      .eq("id", cerereId)
      .single();

    if (cerereError || !cerere) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Cererea nu a fost găsită",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    if (cerere.solicitant_id !== user.id) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Nu aveți permisiunea de a descărca documentele pentru această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Fetch all documents
    const { data: documents, error: documentsError } = await supabase
      .from("documente")
      .select("*")
      .eq("cerere_id", cerereId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (documentsError) {
      console.error("Database error fetching documents:", documentsError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la încărcarea documentelor",
          details: { reason: documentsError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    if (!documents || documents.length === 0) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "NO_DOCUMENTS",
          message: "Nu există documente pentru această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Create ZIP file
    const zip = new JSZip();

    // Download and add each file to ZIP
    for (const doc of documents) {
      try {
        // Generate signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("cereri-documente")
          .createSignedUrl(doc.storage_path, 3600); // 1 hour validity

        if (signedUrlError || !signedUrlData) {
          console.error(`Failed to generate signed URL for ${doc.nume_fisier}:`, signedUrlError);
          continue; // Skip this file and continue with others
        }

        // Download file content
        const fileResponse = await fetch(signedUrlData.signedUrl);
        if (!fileResponse.ok) {
          console.error(`Failed to download ${doc.nume_fisier}: ${fileResponse.statusText}`);
          continue;
        }

        const fileBlob = await fileResponse.blob();
        const fileBuffer = await fileBlob.arrayBuffer();

        // Add to ZIP with original filename
        zip.file(doc.nume_fisier, fileBuffer);
      } catch (err) {
        console.error(`Error processing file ${doc.nume_fisier}:`, err);
        // Continue with other files
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "uint8array" });

    // Prepare filename (sanitize registration number if exists)
    const registrationNumber = cerere.numar_inregistrare
      ? cerere.numar_inregistrare.replace(/[^a-zA-Z0-9-]/g, "_")
      : cerereId.substring(0, 8);

    const zipFilename = `cerere_${registrationNumber}_documente.zip`;

    // Return ZIP as stream (convert to Buffer for NextResponse compatibility)
    return new NextResponse(Buffer.from(zipBlob), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
        "Content-Length": zipBlob.length.toString(),
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/cereri/[id]/documents/download-all:", error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare internă de server",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
