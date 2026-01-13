import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { action } = body;

    if (!action || (action !== "dismiss" && action !== "read")) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "dismiss" or "read"' },
        { status: 400 }
      );
    }

    // Prepare update data based on action
    const updateData =
      action === "dismiss"
        ? { dismissed_at: new Date().toISOString() }
        : { read_at: new Date().toISOString() };

    // Update notification (RLS will ensure user owns this notification)
    const { data: notification, error: updateError } = await supabase
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .eq("utilizator_id", user.id)
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

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Unexpected error in PATCH /api/notifications/[id]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
