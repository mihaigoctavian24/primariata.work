import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CerereStatus } from "@/lib/validations/cereri";
import type { ApiResponse, ApiErrorResponse, Cerere } from "@/types/api";
import { sendCerereSubmittedSMS } from "@/lib/sms";

/**
 * POST /api/cereri/[id]/submit
 * Submit a cerere for processing
 *
 * Transitions cerere from 'depusa' to 'in_verificare' status
 * This action is irreversible - once submitted, the cerere enters the approval workflow
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

    // Check if cerere exists and belongs to user
    const { data: existingCerere, error: fetchError } = await supabase
      .from("cereri")
      .select("id, status, solicitant_id, tip_cerere_id")
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
          message: "Nu aveți permisiunea de a trimite această cerere",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 403 });
    }

    // Check if cerere is in correct status for submission
    if (existingCerere.status !== CerereStatus.DEPUSA) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "INVALID_STATUS",
          message: "Cererea nu poate fi trimisă în starea curentă",
          details: {
            current_status: existingCerere.status,
            expected_status: CerereStatus.DEPUSA,
            reason: "Only cereri in 'depusa' status can be submitted",
          },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // TODO: Validate that required documents are uploaded
    // This will be implemented when document upload functionality is added
    // For now, we'll allow submission without document validation

    // Update cerere status to in_verificare
    const { data: updatedCerere, error: updateError } = await supabase
      .from("cereri")
      .update({
        status: CerereStatus.IN_VERIFICARE,
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
        necesita_plata,
        valoare_plata,
        data_termen,
        created_at,
        updated_at
      `
      )
      .single();

    if (updateError) {
      console.error("Database error submitting cerere:", updateError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la trimiterea cererii",
          details: { reason: updateError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Send SMS notification to user if enabled
    try {
      const { data: utilizator } = await supabase
        .from("utilizatori")
        .select("telefon, sms_notifications_enabled")
        .eq("id", user.id)
        .single();

      if (utilizator?.sms_notifications_enabled && utilizator?.telefon) {
        const smsResult = await sendCerereSubmittedSMS(
          utilizator.telefon,
          updatedCerere.id,
          user.id
        );

        if (!smsResult.success) {
          console.error("Failed to send cerere submitted SMS:", smsResult.error);
          // Don't fail the request - cerere was submitted successfully
        } else {
          console.log(`SMS sent to ${utilizator.telefon} for cerere ${updatedCerere.id}`);
        }
      }
    } catch (smsError) {
      console.error("Error sending cerere submitted SMS:", smsError);
      // Don't fail the request - cerere was submitted successfully
    }

    // TODO: Create notification for primarie staff (funcționari)
    // This will be implemented when notification system is added

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
    console.error("Unexpected error in POST /api/cereri/[id]/submit:", error);
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
