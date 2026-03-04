import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAndStoreReceipt } from "@/actions/receipts";
import type { ApiErrorResponse } from "@/types/api";

/**
 * GET /api/plati/[id]/chitanta
 * Download chitanta PDF for a successful payment.
 *
 * If no chitanta exists yet, triggers on-demand generation.
 *
 * Returns:
 * - PDF file with proper headers (Content-Type: application/pdf)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { id } = await params;

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
          message: "Autentificare necesara",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Verify payment exists and user has access (RLS enforced)
    const { data: plata, error: plataError } = await supabase
      .from("plati")
      .select("id, status")
      .eq("id", id)
      .single();

    if (plataError || !plata) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PAYMENT_NOT_FOUND",
          message: "Plata nu a fost gasita sau nu aveti acces la ea",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify payment is successful
    if (plata.status !== "success") {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "PAYMENT_NOT_COMPLETED",
          message: "Chitanta este disponibila doar pentru platile finalizate",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch chitanta
    let { data: chitanta } = await supabase
      .from("chitante")
      .select("id, numar_chitanta, pdf_url")
      .eq("plata_id", id)
      .maybeSingle();

    // If no chitanta exists, trigger on-demand generation
    if (!chitanta) {
      const result = await generateAndStoreReceipt(id);
      if (!result.success) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "RECEIPT_GENERATION_FAILED",
            message: "Nu s-a putut genera chitanta",
            details: { error: result.error },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 500 });
      }

      // Re-fetch the newly created chitanta
      const { data: newChitanta } = await supabase
        .from("chitante")
        .select("id, numar_chitanta, pdf_url")
        .eq("plata_id", id)
        .single();

      chitanta = newChitanta;
    }

    if (!chitanta?.pdf_url) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "RECEIPT_NOT_FOUND",
          message: "Chitanta nu a fost gasita. Contactati suportul.",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Download PDF from Supabase Storage
    const { data: pdfBlob, error: downloadError } = await supabase.storage
      .from("chitante")
      .download(chitanta.pdf_url);

    if (downloadError || !pdfBlob) {
      logger.error("Failed to download receipt PDF:", downloadError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DOWNLOAD_FAILED",
          message: "Eroare la descarcarea chitantei",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="chitanta-${chitanta.numar_chitanta}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    logger.error("Unexpected error in GET /api/plati/[id]/chitanta:", error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare interna de server",
      },
      meta: { timestamp: new Date().toISOString() },
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
