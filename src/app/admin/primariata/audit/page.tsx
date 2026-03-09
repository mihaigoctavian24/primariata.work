import { Suspense } from "react";
import { SaAuditContent } from "../_components/sa-audit-content";
import { SaAuditSkeleton } from "../_components/sa-audit-skeleton";
import { getAuditLog } from "@/actions/super-admin-stats";

export default async function SuperAdminAuditPage() {
  const result = await getAuditLog();
  return (
    <Suspense fallback={<SaAuditSkeleton />}>
      <SaAuditContent initialData={result} />
    </Suspense>
  );
}
