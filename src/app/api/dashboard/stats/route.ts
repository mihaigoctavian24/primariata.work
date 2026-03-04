import { logger } from "@/lib/logger";
import { type NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";

export interface DashboardStats {
  cereri: {
    total: number;
    in_progres: number; // draft + in_procesare + in_asteptare
    finalizate: number; // aprobat + respins + anulat
  };
  plati: {
    total: number;
    total_suma: number; // sum of all successful payments
    pending: number; // cereri with necesita_plata=true and unpaid
  };
}

/**
 * GET /api/dashboard/stats?judet=slug&localitate=slug
 * Get dashboard statistics for the authenticated user within a specific primarie
 *
 * Query params:
 * - judet: județ slug (required)
 * - localitate: localitate slug (required)
 *
 * Returns:
 * - Total cereri count
 * - Cereri by status groups (in progress, finalized)
 * - Total payments count and sum
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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
          message: "Autentificare necesara",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Resolve primarie context from query params
    const judet = request.nextUrl.searchParams.get("judet");
    const localitate = request.nextUrl.searchParams.get("localitate");

    if (!judet || !localitate) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "Parametrii judet si localitate sunt necesari",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Resolve primarie from slugs using service role (bypasses RLS for lookup)
    const serviceClient = createServiceRoleClient();
    const { data: primarie } = await serviceClient
      .from("primarii")
      .select("id, localitati!inner(slug, judete!inner(slug))")
      .eq("localitati.slug", localitate)
      .eq("localitati.judete.slug", judet)
      .eq("activa", true)
      .single();

    if (!primarie) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Primaria nu a fost gasita",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Fetch cereri statistics
    // RLS still runs (user must own the cereri), but we also filter by primarie_id
    // since the /api/* routes don't receive the x-primarie-id header from middleware
    const { data: cereriData, error: cereriError } = await supabase
      .from("cereri")
      .select("status", { count: "exact", head: false })
      .eq("primarie_id", primarie.id);

    if (cereriError) {
      throw cereriError;
    }

    // Count cereri by status groups
    const total_cereri = cereriData?.length || 0;
    const in_progres =
      cereriData?.filter((c) => ["draft", "in_procesare", "in_asteptare"].includes(c.status))
        .length || 0;
    const finalizate =
      cereriData?.filter((c) => ["aprobat", "respins", "anulat"].includes(c.status)).length || 0;

    // Fetch payments statistics
    // Same approach: RLS + explicit primarie_id filter
    const { data: platiData, error: platiError } = await supabase
      .from("plati")
      .select("suma, status")
      .eq("primarie_id", primarie.id);

    if (platiError) {
      throw platiError;
    }

    const total_plati = platiData?.length || 0;
    const total_suma =
      platiData?.filter((p) => p.status === "success").reduce((sum, p) => sum + (p.suma || 0), 0) ||
      0;

    // Count pending payments: cereri with necesita_plata=true and not yet paid
    const { count: pendingPlatiCount } = await supabase
      .from("cereri")
      .select("id", { count: "exact", head: true })
      .eq("primarie_id", primarie.id)
      .eq("necesita_plata", true)
      .or("plata_efectuata.is.null,plata_efectuata.eq.false")
      .not("status", "in", "(anulata,respinsa)");

    const stats: DashboardStats = {
      cereri: {
        total: total_cereri,
        in_progres,
        finalizate,
      },
      plati: {
        total: total_plati,
        total_suma,
        pending: pendingPlatiCount ?? 0,
      },
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error("[Dashboard Stats API] Error:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare la incarcarea statisticilor",
        details: error instanceof Error ? { message: error.message } : undefined,
      },
      meta: { timestamp: new Date().toISOString() },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
