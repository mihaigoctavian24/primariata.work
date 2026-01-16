import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  updateCerereSchema,
  canModifyCerere,
  type CerereStatusType,
} from "@/lib/validations/cereri";
import type { ApiResponse, ApiErrorResponse, Cerere } from "@/types/api";
import { ZodError } from "zod";
import { csrfProtectionFromRequest } from "@/lib/middleware/csrf-protection";

/**
 * GET /api/cereri/[id]
 * Retrieve a single cerere by ID
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Autentificare necesară",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const { id } = await params;

    // Query cerere with tip_cerere details
    const { data: cerere, error } = await supabase
      .from("cereri")
      .select(
        `
        id,
        primarie_id,
        tip_cerere_id,
        solicitant_id,
        preluat_de_id,
        numar_inregistrare,
        date_formular,
        observatii_solicitant,
        status,
        raspuns,
        motiv_respingere,
        necesita_plata,
        valoare_plata,
        plata_efectuata,
        plata_efectuata_la,
        data_termen,
        data_finalizare,
        created_at,
        updated_at,
        tip_cerere:tipuri_cereri(
          id,
          cod,
          nume,
          descriere,
          campuri_formular,
          documente_necesare,
          termen_legal_zile,
          necesita_taxa,
          valoare_taxa,
          departament_responsabil
        )
      `
      )
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
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

      console.error("Database error fetching cerere:", error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la încărcarea cererii",
          details: { reason: error.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<Cerere> = {
      success: true,
      data: cerere as Cerere,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Don't cache user-specific data
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/cereri/[id]:", error);
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
 * PATCH /api/cereri/[id]
 * Update a cerere (only allowed in draft or info_suplimentare status)
 *
 * Body:
 * - date_formular (optional): Updated form data
 * - observatii_solicitant (optional): Updated notes
 *
 * Security:
 * - CSRF protection for state-changing operation
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // CSRF Protection
    const csrfError = csrfProtectionFromRequest(request);
    if (csrfError) return csrfError;

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Autentificare necesară",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const { id } = await params;

    // Parse request body
    const body = await request.json();

    // Validate request body
    let validatedData;
    try {
      validatedData = updateCerereSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Date invalide",
            details: { errors: error.format() },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }

    // Check if cerere exists and belongs to user
    const { data: existingCerere, error: fetchError } = await supabase
      .from("cereri")
      .select("id, status, solicitant_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existingCerere) {
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

    // Verify ownership (RLS will also enforce this, but explicit check is clearer)
    if (existingCerere.solicitant_id !== user.id) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Nu aveți permisiunea de a modifica această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if cerere can be modified based on status
    if (!canModifyCerere(existingCerere.status as CerereStatusType)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Cererea nu poate fi modificată în starea curentă",
          details: {
            current_status: existingCerere.status,
            reason: "Only cereri in 'depusa' or 'info_suplimentare' status can be modified",
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Build update object (only include provided fields)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.date_formular !== undefined) {
      updateData.date_formular = validatedData.date_formular;
    }

    if (validatedData.observatii_solicitant !== undefined) {
      updateData.observatii_solicitant = validatedData.observatii_solicitant;
    }

    // Update cerere
    const { data: updatedCerere, error: updateError } = await supabase
      .from("cereri")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        primarie_id,
        tip_cerere_id,
        solicitant_id,
        preluat_de_id,
        numar_inregistrare,
        date_formular,
        observatii_solicitant,
        status,
        raspuns,
        motiv_respingere,
        necesita_plata,
        valoare_plata,
        plata_efectuata,
        plata_efectuata_la,
        data_termen,
        data_finalizare,
        created_at,
        updated_at
      `
      )
      .single();

    if (updateError) {
      console.error("Database error updating cerere:", updateError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la actualizarea cererii",
          details: { reason: updateError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<Cerere> = {
      success: true,
      data: updatedCerere as Cerere,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/cereri/[id]:", error);
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
 * DELETE /api/cereri/[id]
 * Soft delete a cerere (only allowed for drafts in 'depusa' status)
 *
 * Security:
 * - CSRF protection for state-changing operation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // CSRF Protection
    const csrfError = csrfProtectionFromRequest(request);
    if (csrfError) return csrfError;

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Autentificare necesară",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const { id } = await params;

    // Check if cerere exists and belongs to user
    const { data: existingCerere, error: fetchError } = await supabase
      .from("cereri")
      .select("id, status, solicitant_id")
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existingCerere) {
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

    // Verify ownership
    if (existingCerere.solicitant_id !== user.id) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Nu aveți permisiunea de a șterge această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Only allow deleting drafts (depusa status)
    if (existingCerere.status !== "depusa") {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Doar cererile în status 'depusa' pot fi șterse",
          details: {
            current_status: existingCerere.status,
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Soft delete by setting deleted_at timestamp
    const { error: deleteError } = await supabase
      .from("cereri")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (deleteError) {
      console.error("Database error deleting cerere:", deleteError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la ștergerea cererii",
          details: { reason: deleteError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/cereri/[id]:", error);
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
