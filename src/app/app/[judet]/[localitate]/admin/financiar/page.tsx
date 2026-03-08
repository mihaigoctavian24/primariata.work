import React, { Suspense } from "react";
import { redirect } from "next/navigation";

import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { aggregateByMonthFull, groupByDayOfWeek, groupByMetoda } from "@/lib/financiar-utils";
import type { PlatiRow } from "@/lib/financiar-utils";
import { FinanciarContent } from "@/components/admin/financiar/financiar-content";
import { FinanciarSkeleton } from "@/components/admin/financiar/financiar-skeleton";

// ============================================================================
// Types
// ============================================================================

interface TipCerereRow {
  id: string;
  nume: string;
}

interface DbPlatiRow {
  id: string;
  suma: number;
  status: string;
  metoda_plata: string | null;
  created_at: string;
  cerere_id: string | null;
}

// ============================================================================
// Page
// ============================================================================

/**
 * FinanciarPage — Server Component
 *
 * Fetches plati and tipuri_cereri for the current primarie, computes financial
 * aggregations server-side, then hands off to FinanciarContent (Client Component).
 *
 * Protected: admin or super_admin role required.
 */
export default async function FinanciarPage(): Promise<React.JSX.Element> {
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

  // === DATA FETCH ===
  const supabase = createServiceRoleClient();
  const sevenMonthsAgo = new Date(Date.now() - 7 * 30 * 24 * 60 * 60 * 1000).toISOString();

  const [platiResult, tipuriResult] = await Promise.all([
    supabase
      .from("plati")
      .select("id, suma, status, metoda_plata, created_at, cerere_id")
      .eq("primarie_id", primarieId)
      .gte("created_at", sevenMonthsAgo)
      .order("created_at", { ascending: false }),
    supabase.from("tipuri_cereri").select("id, nume").eq("primarie_id", primarieId),
  ]);

  const rawPlati: DbPlatiRow[] = platiResult.data ?? [];
  const tipuriCereri: TipCerereRow[] = tipuriResult.data ?? [];

  // Map DB rows to PlatiRow interface used by financiar-utils
  const plati: PlatiRow[] = rawPlati.map((p) => ({
    suma: p.suma,
    status: p.status,
    metoda_plata: p.metoda_plata,
    created_at: p.created_at,
  }));

  // === SERVER-SIDE AGGREGATIONS ===
  const monthlyData = aggregateByMonthFull(plati);
  const dailyData = groupByDayOfWeek(plati);
  const metodaData = groupByMetoda(plati);

  const totalRevenue = plati
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + p.suma, 0);

  // === RENDER ===
  return (
    <Suspense fallback={<FinanciarSkeleton />}>
      <FinanciarContent
        plati={rawPlati}
        monthlyData={monthlyData}
        dailyData={dailyData}
        metodaData={metodaData}
        tipuriCereri={tipuriCereri}
        totalRevenue={totalRevenue}
      />
    </Suspense>
  );
}
