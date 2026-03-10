import { Suspense } from "react";
import { getPrimarDashboardData } from "@/actions/primar-actions";
import { PrimarDashboardContent } from "./_components/primar-dashboard-content";
import { PrimarDashboardSkeleton } from "./_components/primar-dashboard-skeleton";

export default async function PrimarPage(): Promise<React.ReactElement> {
  const result = await getPrimarDashboardData();
  return (
    <Suspense fallback={<PrimarDashboardSkeleton />}>
      <PrimarDashboardContent initialData={result} />
    </Suspense>
  );
}
