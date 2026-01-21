import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { invitationFiltersSchema } from "@/lib/validations/staff-invite";

/**
 * GET /api/admin/users/invitations
 * List staff invitations with pagination and filtering
 *
 * Authorization: admin, super_admin only
 *
 * Query Parameters:
 * - status?: "pending" | "accepted" | "expired" | "cancelled" (filter by status)
 * - page?: number (default 1)
 * - limit?: number (10-100, default 20)
 *
 * Response:
 * - 200 OK: { invitations: [], pagination: { page, limit, total, totalPages } }
 * - 401 Unauthorized: No authentication
 * - 403 Forbidden: Insufficient permissions
 * - 500 Internal Server Error: Database errors
 */
export async function GET(request: NextRequest) {
  try {
    // ===================================================================
    // STEP 1: Authentication Check
    // ===================================================================

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }

    // ===================================================================
    // STEP 2: Authorization Check (Admin/Super Admin)
    // ===================================================================

    const { data: userData, error: userError } = await authClient
      .from("utilizatori")
      .select("rol, primarie_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!["admin", "super_admin"].includes(userData.rol)) {
      return NextResponse.json(
        { error: "Forbidden - Admin or super admin role required" },
        { status: 403 }
      );
    }

    // Check primarie_id for admin users
    if (userData.rol === "admin" && !userData.primarie_id) {
      return NextResponse.json({ error: "Admin user must have a primarie" }, { status: 400 });
    }

    // ===================================================================
    // STEP 3: Parse and Validate Query Parameters
    // ===================================================================

    const searchParams = request.nextUrl.searchParams;
    const filters = invitationFiltersSchema.parse({
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20,
    });

    // ===================================================================
    // STEP 4: Build Query with Filters
    // ===================================================================

    const supabase = createServiceRoleClient();

    let query = supabase
      .from("user_invitations")
      .select("*", { count: "exact" })
      .order("invited_at", { ascending: false });

    // Apply status filter
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    // RLS Enforcement: Admin can only see their primarie's invitations (super_admin sees all)
    if (userData.rol === "admin" && userData.primarie_id) {
      query = query.eq("primarie_id", userData.primarie_id);
    }

    // Apply pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    query = query.range(from, to);

    // ===================================================================
    // STEP 5: Execute Query
    // ===================================================================

    const { data: invitations, error: invitationsError, count } = await query;

    if (invitationsError) {
      console.error("Failed to fetch invitations:", invitationsError);
      return NextResponse.json(
        { error: "Failed to fetch invitations", details: invitationsError.message },
        { status: 500 }
      );
    }

    // ===================================================================
    // STEP 6: Calculate Pagination
    // ===================================================================

    const total = count || 0;
    const totalPages = Math.ceil(total / filters.limit);

    // ===================================================================
    // STEP 7: Return Response
    // ===================================================================

    return NextResponse.json(
      {
        invitations: invitations || [],
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/admin/users/invitations:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
