import { Suspense } from "react";
import { SaAdminsContent } from "../_components/sa-admins-content";
import { SaAdminsSkeleton } from "../_components/sa-admins-skeleton";
import { getAdminsList } from "@/actions/super-admin-stats";

export default async function SuperAdminAdminsPage() {
  const result = await getAdminsList();
  return (
    <Suspense fallback={<SaAdminsSkeleton />}>
      <SaAdminsContent initialData={result} />
    </Suspense>
  );
}
