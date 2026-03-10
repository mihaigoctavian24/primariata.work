import { Suspense } from "react";
import { getPrimarAgendeData } from "@/actions/primar-actions";
import { PrimarAgendeContent } from "../_components/primar-agende-content";
import { PrimarAgendeSkeleton } from "../_components/primar-agende-skeleton";

export default async function PrimarAgendePage(): Promise<React.ReactElement> {
  const now = new Date();
  const result = await getPrimarAgendeData(now.getFullYear(), now.getMonth() + 1);
  return (
    <Suspense fallback={<PrimarAgendeSkeleton />}>
      <PrimarAgendeContent
        initialData={result}
        initialYear={now.getFullYear()}
        initialMonth={now.getMonth() + 1}
      />
    </Suspense>
  );
}
