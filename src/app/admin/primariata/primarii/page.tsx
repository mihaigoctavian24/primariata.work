import { Suspense } from "react";
import { SaPrimariiContent } from "../_components/sa-primarii-content";
import { SaPrimariiSkeleton } from "../_components/sa-primarii-skeleton";
import { getPrimariiList } from "@/actions/super-admin-stats";

interface PrimariiPageProps {
  searchParams: Promise<{ judet?: string; status?: string; search?: string }>;
}

export default async function SuperAdminPrimariiPage(props: PrimariiPageProps) {
  const searchParams = await props.searchParams;
  const result = await getPrimariiList({
    judet: searchParams.judet,
    status: searchParams.status,
    search: searchParams.search,
  });
  return (
    <Suspense fallback={<SaPrimariiSkeleton />}>
      <SaPrimariiContent initialData={result} />
    </Suspense>
  );
}
