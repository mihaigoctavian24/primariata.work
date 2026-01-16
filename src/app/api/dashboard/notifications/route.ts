import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withRateLimit, getSupabaseUserId } from "@/lib/middleware/rate-limit";
import { requireAuth, validateUUID, requireOwnership } from "@/lib/auth/authorization";
import { csrfProtectionFromRequest } from "@/lib/middleware/csrf-protection";

/**
 * GET /api/dashboard/notifications
 *
 * Returns active notifications for the user
 *
 * Response format:
 * {
 *   success: true,
 *   data: Notification[]
 * }
 *
 * Rate Limit: READ tier (100 requests per 15 minutes)
 */
async function getHandler(_req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch active notifications (unread ones first)
    const { data: notifications, error: notificationsError } = await supabase
      .from("notifications")
      .select("*")
      .eq("utilizator_id", user.id)
      .is("dismissed_at", null)
      .order("read_at", { ascending: true, nullsFirst: true }) // Unread first
      .order("created_at", { ascending: false })
      .limit(10);

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch notifications" },
        { status: 500 }
      );
    }

    // Transform data to match frontend expected format
    const transformedNotifications = (notifications || []).map((notif) => ({
      id: notif.id,
      type: notif.type,
      priority: notif.priority,
      title: notif.title,
      message: notif.message,
      action: notif.action_url
        ? {
            label: notif.action_label || "Vezi detalii",
            url: notif.action_url,
          }
        : undefined,
      timestamp: notif.created_at,
      read: !!notif.read_at,
    }));

    return NextResponse.json({
      success: true,
      data: transformedNotifications,
    });
  } catch (error) {
    console.error("Unexpected error in notifications:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH /api/dashboard/notifications/:id
 *
 * Dismiss or mark notification as read
 *
 * Body:
 * {
 *   action: "dismiss" | "read",
 *   notificationId: string
 * }
 *
 * Rate Limit: WRITE tier (20 requests per 15 minutes)
 *
 * Security:
 * - CSRF protection for state-changing operation
 * - Authentication required
 * - Ownership verification: Users can only update their own notifications
 * - UUID validation for notification ID
 */
async function patchHandler(request: NextRequest) {
  try {
    // 1. CSRF Protection
    const csrfError = csrfProtectionFromRequest(request);
    if (csrfError) return csrfError;

    // 2. Authentication check
    const authError = await requireAuth(request);
    if (authError) return authError;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { action, notificationId } = body;

    if (!action || !notificationId) {
      return NextResponse.json(
        { success: false, error: "Missing action or notificationId" },
        { status: 400 }
      );
    }

    // 3. Validate UUID format
    const uuidError = validateUUID(notificationId, "notificationId");
    if (uuidError) return uuidError;

    // 4. Fetch notification to verify existence and ownership
    const { data: notification, error: fetchError } = await supabase
      .from("notifications")
      .select("id, utilizator_id")
      .eq("id", notificationId)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    // 5. Verify ownership explicitly
    const ownershipError = await requireOwnership(
      notification.utilizator_id,
      request,
      "notificare"
    );
    if (ownershipError) return ownershipError;

    // 6. Validate action
    const updateData: { dismissed_at?: string; read_at?: string } = {};
    if (action === "dismiss") {
      updateData.dismissed_at = new Date().toISOString();
    } else if (action === "read") {
      updateData.read_at = new Date().toISOString();
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid action. Use 'dismiss' or 'read'" },
        { status: 400 }
      );
    }

    // 7. Update notification
    const { error: updateError } = await supabase
      .from("notifications")
      .update(updateData)
      .eq("id", notificationId)
      .eq("utilizator_id", user!.id); // Additional security layer beyond ownership check

    if (updateError) {
      console.error("Error updating notification:", updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Notification ${action}ed successfully`,
    });
  } catch (error) {
    console.error("Unexpected error in PATCH notifications:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// Export with rate limiting middleware
export const GET = withRateLimit("READ", getHandler, getSupabaseUserId);
export const PATCH = withRateLimit("WRITE", patchHandler, getSupabaseUserId);
