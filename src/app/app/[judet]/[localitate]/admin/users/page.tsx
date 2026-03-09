import { createServiceRoleClient } from "@/lib/supabase/server";
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
export default async function UtilizatoriPage(): Promise<React.ReactElement> {
  // Auth + role enforcement is handled by middleware (user_primarii.rol check).
  // primarieId is read from x-primarie-id header injected by middleware.
  const primarieId = (await headers()).get("x-primarie-id");

  if (!primarieId) {
    redirect("/location");
  }

  return (
    <Suspense fallback={<UtilizatoriSkeleton />}>
      <UtilizatoriDataWrapper primarieId={primarieId} />
    </Suspense>
  );
}

async function UtilizatoriDataWrapper({ primarieId }: { primarieId: string }) {
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

  return <UtilizatoriContent users={users} growthData={growthData} primarieId={primarieId} />;
}
