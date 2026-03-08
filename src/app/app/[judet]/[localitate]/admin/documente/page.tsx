import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumenteContent } from "@/components/admin/documente/documente-content";
import { DocumenteSkeleton } from "@/components/admin/documente/documente-skeleton";

/**
 * DocumentePage — Server Component (auth check only).
 *
 * Protected route — requires authentication and admin/super_admin role.
 *
 * All Supabase Storage operations are performed client-side inside
 * DocumenteContent, so this page only needs to extract primarieId.
 */
export default async function DocumentePage(): Promise<React.JSX.Element> {
  // === AUTH CHECK ===
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await supabase
    .from("utilizatori")
    .select("rol, primarie_id")
    .eq("id", user.id)
    .single();

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    redirect("/auth/login");
  }

  const primarieId = userData.primarie_id;
  if (!primarieId) {
    redirect("/auth/login");
  }

  // === RENDER ===
  return (
    <Suspense fallback={<DocumenteSkeleton />}>
      <DocumenteContent primarieId={primarieId} />
    </Suspense>
  );
}
