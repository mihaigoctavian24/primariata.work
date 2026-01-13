import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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
  };
}

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for the authenticated user
 *
 * Returns:
 * - Total cereri count
 * - Cereri by status groups (in progress, finalized)
 * - Total payments count and sum
 */
export async function GET() {
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

    // Fetch cereri statistics
    // RLS ensures users only see their own cereri
    const { data: cereriData, error: cereriError } = await supabase
      .from("cereri")
      .select("status", { count: "exact", head: false });

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
    // RLS ensures users only see their own payments
    const { data: platiData, error: platiError } = await supabase
      .from("plati")
      .select("suma, status");

    if (platiError) {
      throw platiError;
    }

    const total_plati = platiData?.length || 0;
    const total_suma =
      platiData?.filter((p) => p.status === "success").reduce((sum, p) => sum + (p.suma || 0), 0) ||
      0;

    const stats: DashboardStats = {
      cereri: {
        total: total_cereri,
        in_progres,
        finalizate,
      },
      plati: {
        total: total_plati,
        total_suma,
      },
    };

    const response: ApiResponse<DashboardStats> = {
      success: true,
      data: stats,
      meta: { timestamp: new Date().toISOString() },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[Dashboard Stats API] Error:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Eroare la încărcarea statisticilor",
        details: error instanceof Error ? { message: error.message } : undefined,
      },
      meta: { timestamp: new Date().toISOString() },
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
