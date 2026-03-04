import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { webhookPlataUpdateSchema, PlataStatus } from "@/lib/validations/plati";
import { getGhiseulClient } from "@/lib/payments/ghiseul-client";
import type { ApiErrorResponse } from "@/types/api";
import { ZodError } from "zod";
import { generateReceiptCore } from "@/actions/receipts";
import type { Database } from "@/types/database.types";

/**
 * POST /api/webhooks/ghiseul
 * Consolidated webhook handler for payment notifications from Ghiseul.ro
 *
 * Security:
 * - HMAC-SHA256 signature verification with replay protection
 * - Excluded from CSRF middleware (verified via x-ghiseul-signature instead)
 * - Uses service role client (bypasses RLS -- webhooks have no user context)
 *
 * Headers expected:
 * - x-ghiseul-signature: HMAC-SHA256 hex signature
 * - x-ghiseul-timestamp: Unix timestamp of webhook creation
 *
 * Body:
 * - transaction_id: External payment transaction ID
 * - status: Payment status (success, failed, etc.)
 * - gateway_response (optional): Full gateway response
 * - metoda_plata (optional): Payment method
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Read raw body for HMAC verification (must be done before parsing)
    const rawBody = await request.text();
    const signature = request.headers.get("x-ghiseul-signature") ?? "";
    const timestamp = request.headers.get("x-ghiseul-timestamp") ?? "";

    // Verify webhook signature
    const client = getGhiseulClient();
    const verification = client.verifyWebhook(rawBody, signature, timestamp);

    if (!verification.valid) {
      logger.security({
        type: "webhook",
        action: "webhook_rejected",
        success: false,
        metadata: {
          reason: verification.reason,
          hasSignature: !!signature,
          hasTimestamp: !!timestamp,
        },
      });
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    logger.security({
      type: "webhook",
      action: "webhook_verified",
      success: true,
      metadata: { timestamp },
    });

    // Use service role client to bypass RLS (webhooks don't have user context)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error("Missing Supabase credentials for webhook handler");
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

    // Parse the verified payload
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PARSE_ERROR",
          message: "Invalid JSON in webhook payload",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate webhook payload
    let validatedData;
    try {
      validatedData = webhookPlataUpdateSchema.parse(body);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.error("Invalid webhook payload", error.format());
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
      logger.error("Payment not found for transaction", {
        transactionId: validatedData.transaction_id,
      });
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
      logger.warn("Payment already finalized", {
        plataId: plata.id,
        status: plata.status,
      });
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
      logger.error("Error updating payment", updateError);
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

    // If payment successful, generate real PDF receipt and update cerere
    if (validatedData.status === PlataStatus.SUCCESS) {
      // Generate real PDF receipt (non-blocking -- failure doesn't fail webhook)
      try {
        // Type the webhook's untyped client for the core function
        const typedSupabase = supabase as unknown as SupabaseClient<Database>;
        const receiptResult = await generateReceiptCore({
          plataId: plata.id,
          supabaseClient: typedSupabase,
          serviceClient: typedSupabase, // Same service role client
          actorUserId: plata.utilizator_id,
        });
        if (!receiptResult.success) {
          logger.error("Webhook receipt generation failed", {
            plataId: plata.id,
            error: receiptResult.error,
          });
        }
      } catch (error) {
        logger.error("Webhook receipt generation threw", { plataId: plata.id, error });
        // Don't fail webhook -- receipt can be regenerated on-demand
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
        logger.error("Error updating cerere payment status", cerereUpdateError);
      }
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
    logger.error("Unexpected error in POST /api/webhooks/ghiseul", error);
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
