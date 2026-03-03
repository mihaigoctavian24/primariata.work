"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

interface StaffMetric {
  actor_id: string;
  actor_name: string;
  cereriProcessed: number;
  avgProcessingHours: number;
}

interface StaffMetricsTableProps {
  metrics: StaffMetric[];
  staffCount: number;
  isLoading: boolean;
}

export function StaffMetricsTable({
  metrics,
  staffCount,
  isLoading,
}: StaffMetricsTableProps): React.ReactElement {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="ml-auto h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const sortedMetrics = [...metrics].sort((a, b) => b.cereriProcessed - a.cereriProcessed);

  return (
    <div className="space-y-4">
      {/* Staff count header */}
      <div className="flex items-center gap-2">
        <Users className="text-muted-foreground h-4 w-4" />
        <Badge variant="secondary" className="gap-1">
          Functionari: {staffCount}
        </Badge>
      </div>

      {sortedMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nicio activitate de procesare inregistrata
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs uppercase">
                <th className="pr-4 pb-2 font-medium">Functionar</th>
                <th className="pr-4 pb-2 text-right font-medium">Cereri Procesate</th>
                <th className="pb-2 text-right font-medium">Timp Mediu</th>
              </tr>
            </thead>
            <tbody>
              {sortedMetrics.map((metric) => (
                <tr key={metric.actor_id} className="border-b transition-colors last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{metric.actor_name}</td>
                  <td className="py-2.5 pr-4 text-right">{metric.cereriProcessed}</td>
                  <td className="py-2.5 text-right">
                    {metric.avgProcessingHours > 0
                      ? `${Math.round(metric.avgProcessingHours)}h`
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
