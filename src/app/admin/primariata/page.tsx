import { Suspense } from "react";
import { SaDashboardContent } from "./_components/sa-dashboard-content";
import { SaDashboardSkeleton } from "./_components/sa-dashboard-skeleton";
import { getDashboardStats } from "@/actions/super-admin-stats";

export default async function SuperAdminDashboardPage() {
  const result = await getDashboardStats();
  return (
    <Suspense fallback={<SaDashboardSkeleton />}>
      <SaDashboardContent initialData={result} />
    </Suspense>
  );
}
