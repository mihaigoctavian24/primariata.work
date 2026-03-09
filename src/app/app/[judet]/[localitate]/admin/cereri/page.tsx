import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { CereriContent } from "@/components/admin/cereri-supervizare/cereri-content";
import { CereriSkeleton } from "@/components/admin/cereri-supervizare/cereri-skeleton";

// ============================================================================
// Types (Wave 0 migration adds prioritate/note_admin/escaladata — not yet in DB types)
// ============================================================================

/** Cerere row with Wave 0 extra columns (migration applied, types not yet regenerated) */
export interface CerereRow {
  id: string;
  numar_inregistrare: string;
  status: string;
  prioritate?: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  note_admin?: any;
  escaladata?: boolean | null;
  data_termen?: string | null;
  preluat_de_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  tip_cerere_id?: string | null;
}

export interface FunctionarRow {
  id: string;
  nume: string;
  prenume: string;
  avatar_url?: string | null;
}

// ============================================================================
// Page
// ============================================================================

export default async function CereriSupervizarePage() {
  // Auth + role enforcement is handled by middleware (user_primarii.rol check).
  // primarieId is read from x-primarie-id header injected by middleware.
  const primarieId = (await headers()).get("x-primarie-id");
  if (!primarieId) redirect("/auth/login");

  return (
    <Suspense fallback={<CereriSkeleton />}>
      <CereriDataWrapper primarieId={primarieId} />
    </Suspense>
  );
}

async function CereriDataWrapper({ primarieId }: { primarieId: string }) {
  const supabase = createServiceRoleClient();

  const [cereriResult, functionariResult] = await Promise.all([
    supabase
      .from("cereri")
      .select(
        "id, numar_inregistrare, status, prioritate, note_admin, escaladata, data_termen, preluat_de_id, created_at, updated_at, tip_cerere_id"
      )
      .eq("primarie_id", primarieId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(200),
    supabase
      .from("utilizatori")
      .select("id, nume, prenume, avatar_url")
      .eq("primarie_id", primarieId)
      .in("rol", ["functionar", "primar"]),
  ]);

  const cereri = (cereriResult.data ?? []) as unknown as CerereRow[];
  const functionari = (functionariResult.data ?? []) as FunctionarRow[];

  return <CereriContent cereri={cereri} functionari={functionari} />;
}
