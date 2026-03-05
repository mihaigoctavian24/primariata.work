import { NextResponse } from "next/server";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { fetchDashboardData } from "@/lib/admin-dashboard-queries";

export async function GET(): Promise<NextResponse> {
  try {
    // Authenticate user
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    const { data: userData } = await authClient
      .from("utilizatori")
      .select("rol, nume, prenume, email, primarie_id, primarii(localitati(nume, judete(nume)))")
      .eq("id", user.id)
      .single();

    if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 401 });
    }

    const primarieId = userData.primarie_id;
    if (!primarieId) {
      return NextResponse.json({ error: "No primarie assigned" }, { status: 400 });
    }

    const adminName =
      userData.nume && userData.prenume
        ? `${userData.prenume} ${userData.nume}`
        : userData.email || "Admin";

    const primarii = userData.primarii as {
      localitati: { nume: string; judete: { nume: string } };
    } | null;
    const primarieName = primarii?.localitati?.nume ?? "";
    const judetName = primarii?.localitati?.judete?.nume ?? "";

    const supabase = createServiceRoleClient();
    const data = await fetchDashboardData(supabase, primarieId, adminName, primarieName, judetName);

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
