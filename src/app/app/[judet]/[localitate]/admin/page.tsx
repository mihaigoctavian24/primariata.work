import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminDashboardSkeleton } from "@/components/admin/dashboard/admin-dashboard-skeleton";
import { AdminDashboardContent } from "@/components/admin/dashboard/admin-dashboard-content";

/**
 * Admin Dashboard Page
 *
 * Auth + role enforcement is handled by middleware (user_primarii.rol check).
 * primarieId is read from x-primarie-id header injected by middleware.
 * All data fetching happens inside AdminDashboardContent (wrapped in Suspense)
 * so loading.tsx / AdminDashboardSkeleton shows immediately.
 */
export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ judet: string; localitate: string }>;
}) {
  const { judet, localitate } = await params;
  const primarieId = (await headers()).get("x-primarie-id");
  if (!primarieId) redirect("/auth/login");

  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboardContent primarieId={primarieId} judet={judet} localitate={localitate} />
    </Suspense>
  );
}
