import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCerereSchema, listCereriQuerySchema, CerereStatus } from "@/lib/validations/cereri";
import type {
  ApiResponse,
  ApiErrorResponse,
  Cerere,
  PaginatedResponse,
  PaginationMeta,
} from "@/types/api";
import type { Json } from "@/types/database.types";
import { ZodError } from "zod";

/**
 * GET /api/cereri
 * List cereri for the authenticated user with filters and pagination
 *
 * Query Params:
 * - page (optional): Page number (default: 1)
 * - limit (optional): Items per page (default: 20, max: 100)
 * - status (optional): Filter by status
 * - tip_cerere_id (optional): Filter by request type
 * - sort (optional): Sort field (created_at, updated_at, data_termen)
 * - order (optional): Sort order (asc, desc)
 */
export async function GET(request: NextRequest) {
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

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    let queryParams;

    try {
      queryParams = listCereriQuerySchema.parse({
        page: searchParams.get("page") || "1",
        limit: searchParams.get("limit") || "20",
        status: searchParams.get("status") || undefined,
        tip_cerere_id: searchParams.get("tip_cerere_id") || undefined,
        sort: searchParams.get("sort") || "created_at",
        order: searchParams.get("order") || "desc",
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Parametri de interogare invalizi",
            details: { errors: error.format() },
          },
          meta: { timestamp: new Date().toISOString() },
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      throw error;
    }

    const { page, limit, status, tip_cerere_id, sort, order } = queryParams;
    const offset = (page - 1) * limit;

    // Build base query - user can only see their own cereri (enforced by RLS)
    let query = supabase
      .from("cereri")
      .select(
        `
        id,
        primarie_id,
        tip_cerere_id,
        solicitant_id,
        preluat_de_id,
        numar_inregistrare,
        date_formular,
        observatii_solicitant,
        status,
        raspuns,
        motiv_respingere,
        necesita_plata,
        valoare_plata,
        plata_efectuata,
        plata_efectuata_la,
        data_termen,
        data_finalizare,
        created_at,
        updated_at,
        tip_cerere:tipuri_cereri(
          id,
          cod,
          nume,
          descriere,
          termen_legal_zile,
          necesita_taxa,
          valoare_taxa,
          departament_responsabil
        )
      `,
        { count: "exact" }
      )
      .is("deleted_at", null);

    // Apply filters
    if (status) {
      query = query.eq("status", status);
    }

    if (tip_cerere_id) {
      query = query.eq("tip_cerere_id", tip_cerere_id);
    }

    // Apply sorting
    query = query.order(sort, { ascending: order === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: cereri, error, count } = await query;

    if (error) {
      console.error("Database error fetching cereri:", error);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la încărcarea cererilor",
          details: { reason: error.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      total_pages: totalPages,
    };

    const response: PaginatedResponse<Cerere> = {
      success: true,
      data: {
        items: (cereri || []) as Cerere[],
        pagination,
      },
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        // Don't cache user-specific data
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/cereri:", error);
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

/**
 * POST /api/cereri
 * Create a new cerere (draft state)
 *
 * Body:
 * - tip_cerere_id: UUID of request type
 * - date_formular: Dynamic form data
 * - observatii_solicitant (optional): Additional notes
 */
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

    // Parse request body
    const body = await request.json();

    // Validate request body
    let validatedData;
    try {
      validatedData = createCerereSchema.parse(body);
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

    // Get user's primarie_id from utilizatori table
    const { data: utilizator, error: utilizatorError } = await supabase
      .from("utilizatori")
      .select("primarie_id")
      .eq("id", user.id)
      .single();

    if (utilizatorError || !utilizator) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "Utilizator negăsit. Vă rugăm să selectați județul și localitatea.",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Verify tip_cerere exists and is active
    const { data: tipCerere, error: tipCerereError } = await supabase
      .from("tipuri_cereri")
      .select("id, necesita_taxa, valoare_taxa, termen_legal_zile")
      .eq("id", validatedData.tip_cerere_id)
      .eq("activ", true)
      .single();

    if (tipCerereError || !tipCerere) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "REQUEST_TYPE_NOT_FOUND",
          message: "Tipul de cerere nu există sau nu este activ",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Calculate data_termen if termen_legal_zile is set
    const dataTermen = tipCerere.termen_legal_zile
      ? new Date(Date.now() + tipCerere.termen_legal_zile * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // Create cerere
    // Note: numar_inregistrare is auto-generated by trigger - omit field to let trigger handle it
    const insertData = {
      primarie_id: utilizator.primarie_id,
      tip_cerere_id: validatedData.tip_cerere_id,
      solicitant_id: user.id,
      date_formular: validatedData.date_formular as unknown as Json,
      observatii_solicitant: validatedData.observatii_solicitant || null,
      status: CerereStatus.DEPUSA,
      necesita_plata: tipCerere.necesita_taxa,
      valoare_plata: tipCerere.valoare_taxa,
      data_termen: dataTermen,
    };

    // Type assertion needed: trigger auto-generates numar_inregistrare, but TypeScript types don't know about DB triggers
    const { data: cerere, error: insertError } = await supabase
      .from("cereri")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(insertData as any)
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

    if (insertError) {
      console.error("Database error creating cerere:", insertError);
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Eroare la crearea cererii",
          details: { reason: insertError.message },
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: ApiResponse<Cerere> = {
      success: true,
      data: cerere as Cerere,
      meta: {
        timestamp: new Date().toISOString(),
        version: "1.0",
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Unexpected error in POST /api/cereri:", error);
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
