import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { MonitorizareSkeleton } from "@/components/admin/monitorizare/monitorizare-skeleton";
import { MonitorizareContent } from "@/components/admin/monitorizare/monitorizare-content";

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function MonitorizarePage({
  params,
}: {
  params: Promise<{ judet: string; localitate: string }>;
}): Promise<React.JSX.Element> {
  await params; // consume params (not used, but required by Next.js type contract)

  // === AUTH CHECK ===
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: userData, error: userError } = await supabase
    .from("utilizatori")
    .select("rol")
    .eq("id", user.id)
    .single();

  logger.debug("Monitorizare Page Auth:", {
    userId: user.id,
    userRole: userData?.rol,
    userError,
  });

  if (!userData || !["admin", "super_admin"].includes(userData.rol)) {
    logger.error("Access denied — not admin", { userError });
    redirect("/auth/login");
  }

  // === RENDER ===
  // All mock data is self-contained in MonitorizareContent (Phase 20 pattern — no Server Component data pass)
  return (
    <Suspense fallback={<MonitorizareSkeleton />}>
      <MonitorizareContent />
    </Suspense>
  );
}
