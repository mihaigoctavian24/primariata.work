import { Suspense } from "react";
import { getPrimarProiecteData } from "@/actions/primar-actions";
import { PrimarProiecteContent } from "../_components/primar-proiecte-content";
import { PrimarProiecteSkeleton } from "../_components/primar-proiecte-skeleton";

export default async function PrimarProiectePage(): Promise<React.ReactElement> {
  const result = await getPrimarProiecteData();
  return (
    <Suspense fallback={<PrimarProiecteSkeleton />}>
      <PrimarProiecteContent initialData={result} />
    </Suspense>
  );
}
