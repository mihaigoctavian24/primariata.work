import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { webhookPlataUpdateSchema, PlataStatus } from "@/lib/validations/plati";
import type { ApiErrorResponse } from "@/types/api";
import { ZodError } from "zod";

/**
 * POST /api/webhooks/ghiseul
 * Webhook handler for async payment notifications from Ghișeul.ro
 *
 * This endpoint updates payment status based on gateway callbacks
 * and generates chitanță PDF for successful payments.
 *
 * Security:
 * - Uses service role key (bypasses RLS)
 * - TODO Phase 2: Add webhook signature verification
 *
 * Body:
 * - transaction_id: External payment transaction ID
 * - status: Payment status (success, failed, etc.)
 * - gateway_response (optional): Full gateway response
 * - metoda_plata (optional): Payment method
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role client to bypass RLS (webhooks don't have user context)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials for webhook handler");
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "CONFIG_ERROR",
          message: "Server configuration error",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // TODO Phase 2: Verify webhook signature from Ghișeul.ro
    // const signature = request.headers.get('X-Ghiseul-Signature');
    // if (!verifySignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    // }

    // Parse request body
    const body = await request.json();

    // Validate webhook payload
    let validatedData;
    try {
      validatedData = webhookPlataUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Invalid webhook payload:", error.format());
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid webhook payload",
            details: { errors: error.format() },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }

    // Find payment by transaction_id
    const { data: plata, error: findError } = await supabase
      .from("plati")
      .select("id, status, suma, cerere_id, utilizator_id")
      .eq("transaction_id", validatedData.transaction_id)
      .single();

    if (findError || !plata) {
      console.error("Payment not found for transaction:", validatedData.transaction_id);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PAYMENT_NOT_FOUND",
          message: "Payment not found for this transaction",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Prevent duplicate processing (idempotency)
    if (plata.status === PlataStatus.SUCCESS || plata.status === PlataStatus.REFUNDED) {
      console.warn("Payment already finalized:", plata.id, "status:", plata.status);
      return NextResponse.json(
        {
          success: true,
          message: "Payment already processed",
          plata_id: plata.id,
        },
        { status: 200 }
      );
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from("plati")
      .update({
        status: validatedData.status,
        metoda_plata: validatedData.metoda_plata || null,
        gateway_response: validatedData.gateway_response || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", plata.id);

    if (updateError) {
      console.error("Error updating payment:", updateError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to update payment",
          details: { reason: updateError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // If payment successful, generate chitanță and update cerere
    if (validatedData.status === PlataStatus.SUCCESS) {
      // TODO Phase 3: Generate chitanță PDF
      // const pdfUrl = await generateChitantaPDF(plata);

      // For now, create chitanta record with placeholder PDF URL
      const placeholderPdfUrl = `chitante/placeholder-${plata.id}.pdf`;

      const { error: chitantaError } = await supabase.from("chitante").insert({
        plata_id: plata.id,
        pdf_url: placeholderPdfUrl,
        // numar_chitanta auto-generated by trigger
      });

      if (chitantaError) {
        console.error("Error creating chitanta:", chitantaError);
        // Don't fail the webhook - chitanta can be regenerated later
      }

      // Update cerere to mark payment as completed
      const { error: cerereUpdateError } = await supabase
        .from("cereri")
        .update({
          plata_efectuata: true,
          plata_efectuata_la: new Date().toISOString(),
        })
        .eq("id", plata.cerere_id);

      if (cerereUpdateError) {
        console.error("Error updating cerere payment status:", cerereUpdateError);
        // Don't fail the webhook - cerere status can be fixed manually
      }

      // TODO Phase 5: Send email confirmation with chitanta
      // await sendEmailNotification(plata.utilizator_id, 'payment_success', { chitanta });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Payment updated successfully",
        plata_id: plata.id,
        new_status: validatedData.status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error in POST /api/webhooks/ghiseul:", error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
