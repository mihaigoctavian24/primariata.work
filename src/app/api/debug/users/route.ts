import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * DEBUG ENDPOINT - Lista utilizatori pentru testare
 * TO DELETE after testing
 */
export async function GET() {
  const supabase = await createClient();

  const { data: users, error } = await supabase
    .from("utilizatori")
    .select("id, email, nume, prenume, rol, departament, activ")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}
