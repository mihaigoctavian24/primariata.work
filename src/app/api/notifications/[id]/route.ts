import { createClient } from "@/lib/supabase/server";
import { updateNotificationSchema } from "@/lib/validations/notifications";
import { NextResponse } from "next/server";

/**
 * PATCH /api/notifications/[id]
 * Update notification status (read, unread, archive, dismiss)
 *
 * Body:
 * - action: "read" | "unread" | "archive" | "dismiss"
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 1. Authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validatedData = updateNotificationSchema.parse(body);
    const { action } = validatedData;

    // 3. Prepare update data based on action
    let updateData: Record<string, string | null> = {};

    switch (action) {
      case "read":
        // Mark as read AND dismiss (archive) automatically
        const now = new Date().toISOString();
        updateData = {
          read_at: now,
          dismissed_at: now,
        };
        break;
      case "unread":
        // Unmark as read AND remove from archive
        updateData = {
          read_at: null,
          dismissed_at: null,
        };
        break;
      case "archive":
        updateData = {
          dismissed_at: new Date().toISOString(),
          read_at: new Date().toISOString(), // Auto-mark as read when archiving
        };
        break;
      case "dismiss":
        // Dismiss = archive (soft delete)
        updateData = { dismissed_at: new Date().toISOString() };
        break;
    }

    // 4. Update notification (RLS will ensure user owns this notification)
    const { data: notification, error: updateError } = await supabase
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating notification:", updateError);
      return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
    }

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found or access denied" },
        { status: 404 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: {
        ...notification,
        metadata: notification.metadata as Record<string, unknown> | null,
      },
    });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/notifications/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
