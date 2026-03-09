import React, { Suspense } from "react";
import { MonitorizareSkeleton } from "@/components/admin/monitorizare/monitorizare-skeleton";
import { MonitorizareContent } from "@/components/admin/monitorizare/monitorizare-content";

/**
 * Monitorizare Admin Page
 *
 * Auth + role enforcement is handled by middleware (user_primarii.rol check).
 * All data is self-contained in MonitorizareContent (mock data pattern).
 */
export default function MonitorizarePage(): React.JSX.Element {
  return (
    <Suspense fallback={<MonitorizareSkeleton />}>
      <MonitorizareContent />
    </Suspense>
  );
}
