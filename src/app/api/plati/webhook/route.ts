import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { webhookPlataUpdateSchema, PlataStatus } from "@/lib/validations/plati";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";
import type { Json } from "@/types/database.types";
import { ZodError } from "zod";
import { sendPaymentCompletedEmail, sendPaymentFailedEmail } from "@/lib/email";
import { sendStatusChangedSMS } from "@/lib/sms";

/**
 * POST /api/plati/webhook
 * Webhook endpoint for Ghișeul.ro payment gateway callbacks
 *
 * This endpoint receives payment status updates from the payment gateway.
 * It uses service role client to bypass RLS since this is a system operation.
 *
 * Security:
 * - Webhook signature verification (TODO Phase 2 with real Ghișeul.ro)
 * - IP whitelist (TODO Phase 2)
 * - Transaction ID validation
 *
 * Body:
 * - transaction_id: Gateway transaction ID
 * - status: Payment status (success, failed)
 * - gateway_response: Full gateway response object
 * - metoda_plata (optional): Payment method used
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role client to bypass RLS (system operation)
    const supabase = createServiceRoleClient();

    // Parse request body
    const body = await request.json();

    // Validate webhook payload
    let validatedData;
    try {
      validatedData = webhookPlataUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Webhook validation error:", error.format());
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Date invalide în webhook",
            details: { errors: error.format() },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }

    const { transaction_id, status, gateway_response, metoda_plata } = validatedData;

    // TODO Phase 2: Verify webhook signature from Ghișeul.ro
    // TODO Phase 2: Check IP whitelist

    // Find plata by transaction_id (with user info for email)
    const { data: plata, error: findError } = await supabase
      .from("plati")
      .select("id, status, cerere_id, suma, utilizator_id")
      .eq("transaction_id", transaction_id)
      .single();

    if (findError || !plata) {
      console.error("Payment not found for transaction:", transaction_id);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PAYMENT_NOT_FOUND",
          message: `Plata cu transaction_id ${transaction_id} nu a fost găsită`,
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Prevent status updates if payment already finalized
    if (plata.status === PlataStatus.SUCCESS || plata.status === PlataStatus.REFUNDED) {
      console.warn(
        `Attempt to update finalized payment ${plata.id} from ${plata.status} to ${status}`
      );
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PAYMENT_FINALIZED",
          message: "Plata este deja finalizată și nu poate fi modificată",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Update plata status
    const updateData: {
      status: string;
      gateway_response: Json | null;
      metoda_plata?: string | null;
    } = {
      status,
      gateway_response: (gateway_response as Json) || null,
    };

    if (metoda_plata) {
      updateData.metoda_plata = metoda_plata;
    }

    const { error: updateError } = await supabase
      .from("plati")
      .update(updateData)
      .eq("id", plata.id);

    if (updateError) {
      console.error("Error updating plata:", updateError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la actualizarea plății",
          details: { reason: updateError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // If payment successful, update cerere and generate chitanta
    if (status === PlataStatus.SUCCESS) {
      // Update cerere.plata_efectuata (only if cerere_id exists)
      if (plata.cerere_id) {
        const { error: cerereUpdateError } = await supabase
          .from("cereri")
          .update({
            plata_efectuata: true,
            plata_efectuata_la: new Date().toISOString(),
          })
          .eq("id", plata.cerere_id);

        if (cerereUpdateError) {
          console.error("Error updating cerere plata_efectuata:", cerereUpdateError);
          // Don't fail the webhook - payment was successful
        }
      }

      // Generate chitanta (receipt)
      // Note: numar_chitanta is auto-generated by database trigger when NULL
      // Trigger activates WHEN (NEW.numar_chitanta IS NULL)
      const { data: chitanta, error: chitantaError } = await supabase
        .from("chitante")
        .insert({
          plata_id: plata.id,
          pdf_url: `/storage/chitante/${plata.id}.pdf`, // TODO Phase 2: Generate actual PDF
          numar_chitanta: null as unknown as string, // Trigger will auto-generate
        })
        .select()
        .single();

      if (chitantaError) {
        console.error("Error creating chitanta:", chitantaError);
        // Don't fail the webhook - payment was successful, chitanta can be generated later
      } else {
        console.log(`Chitanță created: ${chitanta.numar_chitanta} for plata ${plata.id}`);
      }

      // Send email notification to user
      if (plata.utilizator_id) {
        try {
          // Get user email and name
          const { data: user } = await supabase
            .from("utilizatori")
            .select("email, nume, prenume")
            .eq("id", plata.utilizator_id)
            .single();

          if (user && user.email) {
            // Send payment completed email
            const fullName =
              user.prenume && user.nume ? `${user.prenume} ${user.nume}` : "Utilizator";
            const emailResult = await sendPaymentCompletedEmail(user.email, fullName, plata.id);

            if (!emailResult.success) {
              console.error("Failed to send payment email:", emailResult.error);
              // Don't fail webhook - payment was successful
            } else {
              console.log(`Payment confirmation email sent to ${user.email}`);
            }
          }
        } catch (emailError) {
          console.error("Error sending payment email:", emailError);
          // Don't fail webhook - payment was successful
        }

        // Send SMS notification if user has it enabled
        try {
          const { data: utilizator } = await supabase
            .from("utilizatori")
            .select("telefon, sms_notifications_enabled")
            .eq("id", plata.utilizator_id)
            .single();

          if (utilizator?.sms_notifications_enabled && utilizator?.telefon && plata.cerere_id) {
            const smsResult = await sendStatusChangedSMS(
              utilizator.telefon,
              plata.cerere_id,
              plata.utilizator_id
            );

            if (!smsResult.success) {
              console.error("Failed to send payment SMS:", smsResult.error);
              // Don't fail webhook - payment was successful
            } else {
              console.log(`SMS sent to ${utilizator.telefon} for payment ${plata.id}`);
            }
          }
        } catch (smsError) {
          console.error("Error sending payment SMS:", smsError);
          // Don't fail webhook - payment was successful
        }
      }
    }

    console.log(`Webhook processed: transaction ${transaction_id} → status ${status}`);

    const response: ApiResponse<{ message: string; plata_id: string }> = {
      success: true,
      data: {
        message: "Webhook procesat cu succes",
        plata_id: plata.id,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in POST /api/plati/webhook:", error);
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
