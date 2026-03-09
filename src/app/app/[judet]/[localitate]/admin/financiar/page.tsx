import React, { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createServiceRoleClient } from "@/lib/supabase/server";
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
 * Auth + role enforcement is handled by middleware (user_primarii.rol check).
 * primarieId is read from x-primarie-id header injected by middleware.
 * Data fetching happens inside FinanciarDataWrapper (wrapped in Suspense).
 */
export default async function FinanciarPage(): Promise<React.JSX.Element> {
  const primarieId = (await headers()).get("x-primarie-id");
  if (!primarieId) redirect("/auth/login");

  // === RENDER ===
  return (
    <Suspense fallback={<FinanciarSkeleton />}>
      <FinanciarDataWrapper primarieId={primarieId} />
    </Suspense>
  );
}

async function FinanciarDataWrapper({ primarieId }: { primarieId: string }) {
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

  return (
    <FinanciarContent
      plati={rawPlati}
      monthlyData={monthlyData}
      dailyData={dailyData}
      metodaData={metodaData}
      tipuriCereri={tipuriCereri}
      totalRevenue={totalRevenue}
    />
  );
}
