"use client";

import Link from "next/link";
import { CerereStatus, getCerereStatusLabel } from "@/lib/validations/cereri";
import type { CerereStatusType } from "@/lib/validations/cereri";

interface CereriStatusOverviewProps {
  statusCounts: Record<string, number>;
  judet: string;
  localitate: string;
}

/**
 * CereriStatusOverview component
 * Shows cereri count per status as colored clickable badges.
 * Clicking a badge navigates to /cereri filtered by that status.
 */
export function CereriStatusOverview({
  statusCounts,
  judet,
  localitate,
}: CereriStatusOverviewProps): React.ReactNode {
  const allStatuses: CerereStatusType[] = [
    CerereStatus.DEPUSA,
    CerereStatus.IN_VERIFICARE,
    CerereStatus.INFO_SUPLIMENTARE,
    CerereStatus.IN_PROCESARE,
    CerereStatus.IN_APROBARE,
    CerereStatus.APROBATA,
    CerereStatus.RESPINSA,
    CerereStatus.ANULATA,
    CerereStatus.FINALIZATA,
  ];

  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-3 lg:grid-cols-3">
      {allStatuses.map((status) => {
        const count = statusCounts[status] ?? 0;
        const label = getCerereStatusLabel(status);
        const colors = getStatusBadgeColors(status);
        const isDimmed = count === 0;

        return (
          <Link
            key={status}
            href={`/app/${judet}/${localitate}/cereri?status=${status}`}
            className={`rounded-lg border p-3 text-center transition-all hover:scale-105 hover:shadow-sm ${colors} ${isDimmed ? "opacity-50" : ""}`}
          >
            <p className="text-lg font-bold">{count}</p>
            <p className="text-xs leading-tight font-medium">{label}</p>
          </Link>
        );
      })}
    </div>
  );
}

function getStatusBadgeColors(status: CerereStatusType): string {
  const colorMap: Record<CerereStatusType, string> = {
    [CerereStatus.DEPUSA]:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300",
    [CerereStatus.IN_VERIFICARE]:
      "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300",
    [CerereStatus.INFO_SUPLIMENTARE]:
      "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-300",
    [CerereStatus.IN_PROCESARE]:
      "border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950/30 dark:text-cyan-300",
    [CerereStatus.IN_APROBARE]:
      "border-purple-200 bg-purple-50 text-purple-800 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-300",
    [CerereStatus.APROBATA]:
      "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300",
    [CerereStatus.RESPINSA]:
      "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300",
    [CerereStatus.ANULATA]:
      "border-gray-200 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-950/30 dark:text-gray-300",
    [CerereStatus.FINALIZATA]:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300",
  };
  return colorMap[status] ?? "border-gray-200 bg-gray-50 text-gray-800";
}
