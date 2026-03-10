import { Suspense } from "react";
import { SaAnalyticsContent } from "../_components/sa-analytics-content";
import { SaAnalyticsSkeleton } from "../_components/sa-analytics-skeleton";

export default function SuperAdminAnalyticsPage() {
  return (
    <Suspense fallback={<SaAnalyticsSkeleton />}>
      <SaAnalyticsContent />
    </Suspense>
  );
}
