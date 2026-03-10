import { Suspense } from "react";
import { getPrimarRapoarteData } from "@/actions/primar-actions";
import { PrimarRapoarteContent } from "../_components/primar-rapoarte-content";
import { PrimarRapoarteSkeleton } from "../_components/primar-rapoarte-skeleton";
import { createClient } from "@/lib/supabase/server";

export default async function PrimarRapoartePage(): Promise<React.ReactElement> {
  const [result] = await Promise.all([getPrimarRapoarteData("luna")]);

  // Fetch primarieName for PDF header
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: assoc } = user
    ? await supabase
        .from("user_primarii")
        .select("primarii(numeOficial)")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle()
    : { data: null };

  const primaries = assoc?.primarii as unknown as { numeOficial?: string } | null;
  const primarieName = primaries?.numeOficial ?? "Primărie";

  return (
    <Suspense fallback={<PrimarRapoarteSkeleton />}>
      <PrimarRapoarteContent initialData={result} primarieName={primarieName} />
    </Suspense>
  );
}
