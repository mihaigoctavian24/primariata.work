import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  CerereStatus,
  canCancelCerere,
  cancelCerereSchema,
  type CerereStatusType,
} from "@/lib/validations/cereri";
import type { ApiResponse, ApiErrorResponse, Cerere } from "@/types/api";
import { ZodError } from "zod";

/**
 * POST /api/cereri/[id]/cancel
 * Cancel a cerere
 *
 * Body:
 * - motiv_anulare: Reason for cancellation (min 10 characters)
 *
 * Can only cancel cereri that are not already cancelled, finalized, or rejected
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Parse and validate request body
    const body = await request.json();

    let validatedData;
    try {
      validatedData = cancelCerereSchema.parse(body);
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

    // Verify ownership
    if (existingCerere.solicitant_id !== user.id) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Nu aveți permisiunea de a anula această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if cerere can be cancelled based on status
    if (!canCancelCerere(existingCerere.status as CerereStatusType)) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Cererea nu poate fi anulată în starea curentă",
          details: {
            current_status: existingCerere.status,
            reason: "Cereri that are already cancelled, finalized, or rejected cannot be cancelled",
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Update cerere to cancelled status
    const { data: cancelledCerere, error: updateError } = await supabase
      .from("cereri")
      .update({
        status: CerereStatus.ANULATA,
        motiv_respingere: validatedData.motiv_anulare, // Reuse motiv_respingere field
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        id,
        primarie_id,
        tip_cerere_id,
        solicitant_id,
        numar_inregistrare,
        date_formular,
        observatii_solicitant,
        status,
        motiv_respingere,
        necesita_plata,
        valoare_plata,
        data_termen,
        created_at,
        updated_at
      `
      )
      .single();

    if (updateError) {
      console.error("Database error cancelling cerere:", updateError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la anularea cererii",
          details: { reason: updateError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // TODO: Create notification for user confirming cancellation
    // TODO: Create notification for primarie staff (if cerere was in processing)
    // This will be implemented when notification system is added

    const response: ApiResponse<Cerere> = {
      success: true,
      data: cancelledCerere as Cerere,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in POST /api/cereri/[id]/cancel:", error);
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
