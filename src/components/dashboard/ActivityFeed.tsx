"use client";

import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";
import { getCerereStatusLabel } from "@/lib/validations/cereri";
import type { CerereStatusType } from "@/lib/validations/cereri";

interface ActivityEntry {
  id: string;
  tip: string;
  old_status: string | null;
  new_status: string | null;
  motiv: string | null;
  actor_name: string | null;
  created_at: string;
}

interface ActivityFeedProps {
  entries: ActivityEntry[];
  isLoading: boolean;
}

/**
 * ActivityFeed component
 * Shows last N entries from cerere_istoric with colored dots and relative timestamps.
 *
 * Dot colors:
 * - status_change: blue
 * - nota_interna: gray
 * - document_request: amber
 */
export function ActivityFeed({ entries, isLoading }: ActivityFeedProps): React.ReactNode {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="bg-muted mt-1.5 h-2.5 w-2.5 animate-pulse rounded-full" />
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-3 w-1/3 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!entries.length) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">Nicio activitate recenta</p>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-start gap-3">
          {/* Colored dot */}
          <div
            className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${getDotColor(entry.tip)}`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm">
              <span className="font-medium">{entry.actor_name ?? "Sistem"}</span>{" "}
              <span className="text-muted-foreground">{getActionDescription(entry)}</span>
            </p>
            <p className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(entry.created_at), {
                addSuffix: true,
                locale: ro,
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getDotColor(tip: string): string {
  switch (tip) {
    case "status_change":
      return "bg-blue-500";
    case "nota_interna":
      return "bg-gray-400";
    case "document_request":
      return "bg-amber-500";
    default:
      return "bg-gray-300";
  }
}

function getActionDescription(entry: ActivityEntry): string {
  switch (entry.tip) {
    case "status_change": {
      const oldLabel = entry.old_status
        ? getCerereStatusLabel(entry.old_status as CerereStatusType)
        : null;
      const newLabel = entry.new_status
        ? getCerereStatusLabel(entry.new_status as CerereStatusType)
        : null;
      if (oldLabel && newLabel) {
        return `a schimbat statusul din ${oldLabel} in ${newLabel}`;
      }
      if (newLabel) {
        return `a setat statusul la ${newLabel}`;
      }
      return "a modificat statusul";
    }
    case "nota_interna":
      return "a adaugat o nota interna";
    case "document_request":
      return "a solicitat documente suplimentare";
    default:
      return "a efectuat o actiune";
  }
}
