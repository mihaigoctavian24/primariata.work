import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { Suspense } from "react";
import { UtilizatoriContent } from "@/components/admin/utilizatori/utilizatori-content";
import { UtilizatoriSkeleton } from "@/components/admin/utilizatori/utilizatori-skeleton";

/**
 * Utilizatori Admin Page — Phase 20-01
 *
 * Protected route: requires admin or super_admin role.
 * Fetches all users for the current primarie and passes to UtilizatoriContent.
 *
 * Location: /app/[judet]/[localitate]/admin/users
 */
export default async function UtilizatoriPage({
  params,
}: {
  params: Promise<{ judet: string; localitate: string }>;
}): Promise<React.ReactElement> {
  // Await params (Next.js 15 requirement)
  await params;

  // Auth check with regular client (NOT getAuthContext — that is only for Server Actions)
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Role check: query utilizatori to confirm admin/super_admin
  const { data: userData, error: userError } = await authClient
    .from("utilizatori")
    .select("rol, primarie_id")
    .eq("id", user.id)
    .single();

  if (userError || !userData || !["admin", "super_admin"].includes(userData.rol)) {
    redirect("/auth/login");
  }

  // Get primarie_id from header (set by middleware) or fall back to utilizatori record
  const headersList = await headers();
  const primarieId = headersList.get("x-primarie-id") ?? userData.primarie_id;

  if (!primarieId) {
    redirect("/location");
  }

  // Use service role client for admin operations (bypasses RLS)
  const admin = createServiceRoleClient();

  // 30 days ago for growth chart
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Parallel fetch: all users + growth data
  const [usersResult, growthResult] = await Promise.all([
    admin
      .from("utilizatori")
      .select(
        "id, email, nume, prenume, rol, status, activ, departament, telefon, avatar_url, created_at, last_login_at, primarie_id"
      )
      .eq("primarie_id", primarieId)
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("user_primarii")
      .select("created_at, rol")
      .eq("primarie_id", primarieId)
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const users = usersResult.data ?? [];
  const growthData = growthResult.data ?? [];

  return (
    <Suspense fallback={<UtilizatoriSkeleton />}>
      <UtilizatoriContent users={users} growthData={growthData} primarieId={primarieId} />
    </Suspense>
  );
}
