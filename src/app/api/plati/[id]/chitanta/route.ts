import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiErrorResponse } from "@/types/api";

/**
 * GET /api/plati/[id]/chitanta
 * Download chitanță PDF for a successful payment
 *
 * Returns:
 * - PDF file with proper headers (Content-Type: application/pdf)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
          message: "Autentificare necesară",
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
          message: "Plata nu a fost găsită sau nu aveți acces la ea",
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
          message: "Chitanța este disponibilă doar pentru plățile finalizate",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch chitanta
    const { data: chitanta, error: chitantaError } = await supabase
      .from("chitante")
      .select("id, numar_chitanta, pdf_url")
      .eq("plata_id", id)
      .single();

    if (chitantaError || !chitanta) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "RECEIPT_NOT_FOUND",
          message: "Chitanța nu a fost găsită. Contactați suportul.",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // TODO Phase 3: Download PDF from Supabase Storage
    // For now, return placeholder response
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "Descărcarea chitanței nu este încă implementată. Reveniți în Faza 3.",
        details: {
          chitanta_id: chitanta.id,
          numar_chitanta: chitanta.numar_chitanta,
          pdf_url: chitanta.pdf_url,
        },
      },
      meta: { timestamp: new Date().toISOString() },
    };

    return NextResponse.json(errorResponse, { status: 501 });

    /* TODO Phase 3: Implement actual PDF download
    const { data: pdfBlob, error: downloadError } = await supabase.storage
      .from('chitante')
      .download(chitanta.pdf_url);

    if (downloadError || !pdfBlob) {
      // Error response...
    }

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="chitanta-${chitanta.numar_chitanta}.pdf"`,
        'Cache-Control': 'private, max-age=3600', // Cache for 1 hour
      },
    });
    */
  } catch (error) {
    console.error("Unexpected error in GET /api/plati/[id]/chitanta:", error);
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
