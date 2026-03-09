import React, { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DocumenteContent } from "@/components/admin/documente/documente-content";
import { DocumenteSkeleton } from "@/components/admin/documente/documente-skeleton";

/**
 * DocumentePage — Server Component
 *
 * Auth + role enforcement is handled by middleware (user_primarii.rol check).
 * primarieId is read from x-primarie-id header injected by middleware.
 * All Supabase Storage operations are performed client-side inside DocumenteContent.
 */
export default async function DocumentePage(): Promise<React.JSX.Element> {
  const primarieId = (await headers()).get("x-primarie-id");
  if (!primarieId) redirect("/auth/login");

  return (
    <div className="block h-full w-full">
      <Suspense
        fallback={
          <div className="block h-full w-full">
            <DocumenteSkeleton />
          </div>
        }
      >
        <DocumenteContent primarieId={primarieId} />
      </Suspense>
    </div>
  );
}
