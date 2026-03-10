import { Suspense } from "react";
import { getPrimarBugetData } from "@/actions/primar-actions";
import { PrimarBugetContent } from "../_components/primar-buget-content";
import { PrimarBugetSkeleton } from "../_components/primar-buget-skeleton";

export default async function PrimarBugetPage(): Promise<React.ReactElement> {
  const result = await getPrimarBugetData();
  return (
    <Suspense fallback={<PrimarBugetSkeleton />}>
      <PrimarBugetContent initialData={result} />
    </Suspense>
  );
}
