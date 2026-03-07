import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DocumenteContent } from "@/components/admin/documente/documente-content";
import { DocumenteSkeleton } from "@/components/admin/documente/documente-skeleton";
import type { StorageFile } from "@/components/admin/documente/types";

/**
 * Documente Admin Page
 *
 * Server Component — lists files from the cereri-documente Storage bucket
 * under the ${primarieId}/admin/ prefix.
 *
 * Protected route — requires authentication and admin/super_admin role.
 */
export default async function DocumentePage(): Promise<React.JSX.Element> {
  // === AUTH CHECK ===
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData } = await authClient
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

  // === STORAGE LISTING ===
  const { data: files, error: storageError } = await authClient.storage
    .from("cereri-documente")
    .list(`${primarieId}/admin/`, {
      limit: 100,
      sortBy: { column: "updated_at", order: "desc" },
    });

  if (storageError) {
    // Non-fatal: render with empty state
    console.error("Storage list error:", storageError);
  }

  const safeFiles = (files ?? []) as unknown as StorageFile[];
  const totalBytes = safeFiles.reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0);

  // === RENDER ===
  return (
    <Suspense fallback={<DocumenteSkeleton />}>
      <DocumenteContent files={safeFiles} primarieId={primarieId} totalBytes={totalBytes} />
    </Suspense>
  );
}
