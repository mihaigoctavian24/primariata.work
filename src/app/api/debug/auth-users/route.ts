import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * DEBUG ENDPOINT - Lista utilizatori din Supabase Auth
 * TO DELETE after testing
 */
export async function GET() {
  const supabase = await createClient();

  // Check auth users through admin API
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    count: data.users.length,
    users: data.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      user_metadata: u.user_metadata,
    })),
  });
}
