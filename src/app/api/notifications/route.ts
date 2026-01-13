import { createClient } from "@/lib/supabase/server";
import { type NotificationResponse } from "@/types/notifications";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch active notifications (RLS will filter by utilizator_id automatically)
    const { data: notifications, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .is("dismissed_at", null)
      .or("expires_at.is.null,expires_at.gt.now()")
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Error fetching notifications:", fetchError);
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    // Calculate counts and transform metadata type
    const unreadCount = notifications?.filter((n) => !n.read_at).length || 0;

    // Transform notifications to ensure metadata type compatibility
    const transformedNotifications = (notifications || []).map((n) => ({
      ...n,
      metadata: n.metadata as Record<string, unknown> | null,
    }));

    const response: NotificationResponse = {
      data: transformedNotifications,
      count: notifications?.length || 0,
      unread_count: unreadCount,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Unexpected error in GET /api/notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
