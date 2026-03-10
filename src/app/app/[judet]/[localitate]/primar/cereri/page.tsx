import { Suspense } from "react";
import { getPrimarCereriData } from "@/actions/primar-actions";
import { PrimarCereriContent } from "../_components/primar-cereri-content";
import { PrimarCereriSkeleton } from "../_components/primar-cereri-skeleton";

export default async function PrimarCereriPage(): Promise<React.ReactElement> {
  const result = await getPrimarCereriData();
  return (
    <Suspense fallback={<PrimarCereriSkeleton />}>
      <PrimarCereriContent initialData={result} />
    </Suspense>
  );
}
