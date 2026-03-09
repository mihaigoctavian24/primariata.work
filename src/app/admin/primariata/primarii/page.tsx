import { Suspense } from "react";
import { SaPrimariiContent } from "../_components/sa-primarii-content";
import { SaPrimariiSkeleton } from "../_components/sa-primarii-skeleton";
import { getPrimariiList } from "@/actions/super-admin-stats";

export default async function SuperAdminPrimariiPage() {
  const result = await getPrimariiList();
  return (
    <Suspense fallback={<SaPrimariiSkeleton />}>
      <SaPrimariiContent initialData={result} />
    </Suspense>
  );
}
