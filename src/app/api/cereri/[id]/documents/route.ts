import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

/**
 * POST /api/cereri/[id]/documents
 * Upload a document for a cerere
 *
 * Auth: Requires authenticated user who owns the cerere
 *
 * Body: multipart/form-data
 *   - file: File (required)
 *   - tip_document: string (optional) - "cerere", "anexa", "raspuns"
 *   - descriere: string (optional)
 *
 * Returns: Uploaded document metadata
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
      .select("id, solicitant_id, primarie_id")
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
          message: "Nu aveți permisiunea de a încărca documente pentru această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const tip_document = (formData.get("tip_document") as string) || "anexa";
    const descriere = (formData.get("descriere") as string) || null;

    if (!file) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Fișierul este obligatoriu",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FILE_TOO_LARGE",
          message: `Fișierul este prea mare. Mărimea maximă este ${maxSizeBytes / 1024 / 1024}MB`,
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_FILE_TYPE",
          message: "Tip de fișier invalid. Sunt permise: PDF, JPEG, PNG",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Generate unique storage path: {primarie_id}/{cerere_id}/{timestamp}-{filename}
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${cerere.primarie_id}/${cerereId}/${timestamp}-${sanitizedFileName}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cereri-documente")
      .upload(storagePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UPLOAD_FAILED",
          message: "Eroare la încărcarea fișierului",
          details: { reason: uploadError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from("documente")
      .insert({
        primarie_id: cerere.primarie_id,
        cerere_id: cerereId,
        incarcat_de_id: user.id,
        nume_fisier: file.name,
        tip_fisier: file.type,
        marime_bytes: file.size,
        storage_path: storagePath,
        tip_document,
        descriere,
        este_generat: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);

      // Cleanup storage if DB insert fails
      await supabase.storage.from("documents").remove([storagePath]);

      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la salvarea metadatelor documentului",
          details: { reason: dbError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<typeof document> = {
      success: true,
      data: document,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/cereri/[id]/documents:", error);
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
 * GET /api/cereri/[id]/documents
 * List all documents for a cerere
 *
 * Auth: Requires authenticated user who owns the cerere
 *
 * Returns: Array of document metadata
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
          message: "Nu aveți permisiunea de a vizualiza documentele pentru această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Fetch documents
    const { data: documents, error: documentsError } = await supabase
      .from("documente")
      .select("*")
      .eq("cerere_id", cerereId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

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

    const response: ApiResponse<typeof documents> = {
      success: true,
      data: documents || [],
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in GET /api/cereri/[id]/documents:", error);
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
