import { Suspense } from "react";
import { SaAdminsContent } from "../_components/sa-admins-content";
import { SaAdminsSkeleton } from "../_components/sa-admins-skeleton";
import { getAdminsList } from "@/actions/super-admin-stats";

interface AdminiPageProps {
  searchParams: Promise<{ judet?: string; status?: string; search?: string }>;
}

export default async function SuperAdminAdminsPage(props: AdminiPageProps) {
  const searchParams = await props.searchParams;
  const result = await getAdminsList({
    judet: searchParams.judet,
    status: searchParams.status,
    search: searchParams.search,
  });
  return (
    <Suspense fallback={<SaAdminsSkeleton />}>
      <SaAdminsContent initialData={result} />
    </Suspense>
  );
}
