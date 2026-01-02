import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

/**
 * GET /api/cereri/[id]/documents/[documentId]
 * Download a specific document
 *
 * Auth: Requires authenticated user who owns the cerere
 *
 * Returns: Signed download URL (valid for 60 seconds)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: cerereId, documentId } = await params;

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
      .select("id, solicitant_id")
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
          message: "Nu aveți permisiunea de a descărca acest document",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Fetch document metadata
    const { data: document, error: documentError } = await supabase
      .from("documente")
      .select("*")
      .eq("id", documentId)
      .eq("cerere_id", cerereId)
      .is("deleted_at", null)
      .single();

    if (documentError || !document) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Documentul nu a fost găsit",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("cereri-documente")
      .createSignedUrl(document.storage_path, 3600);

    if (signedUrlError || !signedUrlData) {
      console.error("Signed URL generation error:", signedUrlError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DOWNLOAD_FAILED",
          message: "Eroare la generarea link-ului de descărcare",
          details: { reason: signedUrlError?.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<{ url: string; document: typeof document }> = {
      success: true,
      data: {
        url: signedUrlData.signedUrl,
        document,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/cereri/[id]/documents/[documentId]:", error);
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

/**
 * DELETE /api/cereri/[id]/documents/[documentId]
 * Soft delete a document (sets deleted_at timestamp)
 *
 * Auth: Requires authenticated user who owns the cerere
 *
 * Returns: Success message
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: cerereId, documentId } = await params;

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
      .select("id, solicitant_id, status")
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
          message: "Nu aveți permisiunea de a șterge acest document",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Only allow deletion for draft cereri
    if (cerere.status !== "draft") {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Documentele pot fi șterse doar pentru cererile în draft",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Soft delete document
    const { error: deleteError } = await supabase
      .from("documente")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", documentId)
      .eq("cerere_id", cerereId)
      .is("deleted_at", null);

    if (deleteError) {
      console.error("Database delete error:", deleteError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la ștergerea documentului",
          details: { reason: deleteError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: "Document șters cu succes" },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/cereri/[id]/documents/[documentId]:", error);
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
