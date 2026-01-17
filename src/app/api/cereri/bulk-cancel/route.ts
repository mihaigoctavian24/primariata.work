import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CerereStatus, canCancelCerere, type CerereStatusType } from "@/lib/validations/cereri";
import type { ApiResponse, ApiErrorResponse } from "@/types/api";
import { z } from "zod";

/**
 * POST /api/cereri/bulk-cancel
 * Cancel multiple cereri in a single transaction
 *
 * Body:
 * - cereri_ids: Array of cerere IDs to cancel (max 50)
 * - motiv_anulare: Optional reason for cancellation (applies to all)
 *
 * Can only cancel cereri that are not already cancelled, finalized, or rejected
 *
 * Returns summary of successful and failed cancellations
 */

const bulkCancelSchema = z.object({
  cereri_ids: z
    .array(z.string().uuid())
    .min(1, "Trebuie să selectați cel puțin o cerere")
    .max(50, "Puteți anula maximum 50 de cereri simultan"),
  motiv_anulare: z.string().min(10).max(2000).optional().default("Anulare în masă"),
});

type BulkCancelData = z.infer<typeof bulkCancelSchema>;

interface CancelResult {
  cerere_id: string;
  numar_inregistrare: string;
  success: boolean;
  error?: string;
}

export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    let validatedData: BulkCancelData;

    try {
      validatedData = bulkCancelSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
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

    const { cereri_ids, motiv_anulare } = validatedData;

    // Fetch all requested cereri to verify ownership and status
    const { data: existingCereri, error: fetchError } = await supabase
      .from("cereri")
      .select("id, status, solicitant_id, numar_inregistrare")
      .in("id", cereri_ids)
      .is("deleted_at", null);

    if (fetchError) {
      console.error("Database error fetching cereri:", fetchError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la verificarea cererilor",
          details: { reason: fetchError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    if (!existingCereri || existingCereri.length === 0) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Nicio cerere nu a fost găsită",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Process each cerere and collect results
    const results: CancelResult[] = [];
    const cereriToCancel: string[] = [];

    for (const cerere of existingCereri) {
      // Verify ownership
      if (cerere.solicitant_id !== user.id) {
        results.push({
          cerere_id: cerere.id,
          numar_inregistrare: cerere.numar_inregistrare,
          success: false,
          error: "Nu aveți permisiunea de a anula această cerere",
        });
        continue;
      }

      // Check if cerere can be cancelled based on status
      if (!canCancelCerere(cerere.status as CerereStatusType)) {
        results.push({
          cerere_id: cerere.id,
          numar_inregistrare: cerere.numar_inregistrare,
          success: false,
          error: `Cererea nu poate fi anulată în starea curentă (${cerere.status})`,
        });
        continue;
      }

      // Mark as valid for cancellation
      cereriToCancel.push(cerere.id);
    }

    // Cancel valid cereri in a single update
    if (cereriToCancel.length > 0) {
      const { error: updateError } = await supabase
        .from("cereri")
        .update({
          status: CerereStatus.ANULATA,
          motiv_respingere: motiv_anulare,
          updated_at: new Date().toISOString(),
        })
        .in("id", cereriToCancel);

      if (updateError) {
        console.error("Database error cancelling cereri:", updateError);
        // Mark all as failed if transaction fails
        for (const id of cereriToCancel) {
          const cerere = existingCereri.find((c) => c.id === id);
          results.push({
            cerere_id: id,
            numar_inregistrare: cerere?.numar_inregistrare || "N/A",
            success: false,
            error: "Eroare la anularea cererii în baza de date",
          });
        }
      } else {
        // Mark all as successful
        for (const id of cereriToCancel) {
          const cerere = existingCereri.find((c) => c.id === id);
          results.push({
            cerere_id: id,
            numar_inregistrare: cerere?.numar_inregistrare || "N/A",
            success: true,
          });
        }
      }
    }

    // Calculate summary
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    const response: ApiResponse<{
      total: number;
      succeeded: number;
      failed: number;
      results: CancelResult[];
    }> = {
      success: true,
      data: {
        total: results.length,
        succeeded: successCount,
        failed: failureCount,
        results,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Unexpected error in POST /api/cereri/bulk-cancel:", error);
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
