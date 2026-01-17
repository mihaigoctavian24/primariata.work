import { createClient } from "@/lib/supabase/server";
import { listNotificationsQuerySchema, markAllAsReadSchema } from "@/lib/validations/notifications";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/notifications
 * List notifications with pagination, filtering, and search
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - type: notification type filter
 * - priority: priority filter
 * - status: read status filter (unread/read/archived)
 * - tab: quick filter (toate/urgente/arhiva)
 * - search: full-text search in title and message
 * - sort: sort field (created_at/updated_at/priority)
 * - order: sort order (asc/desc)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate query params
    const searchParams = request.nextUrl.searchParams;
    const queryParams = listNotificationsQuerySchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "10",
      type: searchParams.get("type") || undefined,
      priority: searchParams.get("priority") || undefined,
      status: searchParams.get("status") || undefined,
      tab: searchParams.get("tab") || undefined,
      search: searchParams.get("search") || "",
      sort: searchParams.get("sort") || "created_at",
      order: searchParams.get("order") || "desc",
    });

    const { page, limit, type, priority, status, tab, search, sort, order } = queryParams;

    // 3. Calculate pagination offset
    const offset = (page - 1) * limit;

    // 4. Build query with count
    let query = supabase.from("notifications").select("*", { count: "exact" });

    // 5. Apply filters
    // Type filter
    if (type) {
      query = query.eq("type", type);
    }

    // Priority filter
    if (priority) {
      query = query.eq("priority", priority);
    }

    // Status filter (read/unread/dismissed)
    if (status === "unread") {
      query = query.is("read_at", null).is("dismissed_at", null);
    } else if (status === "read") {
      query = query.not("read_at", "is", null).is("dismissed_at", null);
    } else if (status === "dismissed") {
      query = query.not("dismissed_at", "is", null);
    }

    // Tab filter (overrides status filter)
    if (tab === "urgente") {
      query = query.eq("priority", "urgent").is("dismissed_at", null);
    } else if (tab === "arhiva") {
      query = query.not("dismissed_at", "is", null);
    } else if (tab === "toate") {
      // Show all non-dismissed
      query = query.is("dismissed_at", null);
    }

    // Full-text search (searches title and message)
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,message.ilike.%${search}%`);
    }

    // 6. Apply sorting
    if (sort === "priority") {
      // Priority sorting: urgent > high > medium > low
      query = query.order("priority", { ascending: order === "asc" });
    } else {
      query = query.order(sort, { ascending: order === "asc" });
    }

    // 7. Apply pagination
    query = query.range(offset, offset + limit - 1);

    // 8. Execute query
    const { data: notifications, error: fetchError, count } = await query;

    if (fetchError) {
      console.error("Error fetching notifications:", fetchError);
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    // 9. Calculate total unread count (separate query for accuracy)
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .is("read_at", null)
      .is("dismissed_at", null);

    // 10. Transform metadata for type compatibility
    const transformedNotifications = (notifications || []).map((n) => ({
      ...n,
      metadata: n.metadata as Record<string, unknown> | null,
    }));

    // 11. Calculate pagination metadata
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // 12. Return response
    return NextResponse.json({
      success: true,
      data: {
        items: transformedNotifications,
        pagination: {
          page,
          limit,
          total,
          total_pages: totalPages,
        },
        unread_count: unreadCount || 0,
      },
    });
  } catch (error) {
    console.error("Unexpected error in GET /api/notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/notifications/mark-all-read
 * Mark all unread notifications as read (batch operation)
 *
 * Body:
 * - type?: optional filter to mark only specific type
 * - priority?: optional filter to mark only specific priority
 * - confirm?: boolean confirmation flag
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 1. Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate body
    const body = await request.json();
    const validatedData = markAllAsReadSchema.parse(body);
    const { type, priority } = validatedData;

    // 3. Build update query - Mark as read AND dismiss (archive)
    const now = new Date().toISOString();
    let query = supabase
      .from("notifications")
      .update({
        read_at: now,
        dismissed_at: now, // Auto-archive when marking as read
      })
      .is("read_at", null) // Only unread notifications
      .is("dismissed_at", null); // Exclude already dismissed

    // Apply optional filters
    if (type) {
      query = query.eq("type", type);
    }

    if (priority) {
      query = query.eq("priority", priority);
    }

    // 4. Execute update with count
    const { error: updateError, count } = await query.select();

    if (updateError) {
      console.error("Error marking notifications as read:", updateError);
      return NextResponse.json({ error: "Failed to mark notifications as read" }, { status: 500 });
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: {
        updated_count: count || 0,
        message: `Marcate ${count || 0} notificări ca citite`,
      },
    });
  } catch (error) {
    console.error("Unexpected error in POST /api/notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
