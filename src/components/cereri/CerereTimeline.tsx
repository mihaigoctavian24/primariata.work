"use client";

import { useCerereTimeline } from "@/hooks/use-cerere-timeline";
import type { CerereIstoricEntry } from "@/hooks/use-cerere-timeline";
import { StatusBadge } from "@/components/cereri/StatusBadge";
import { getCerereStatusLabel } from "@/lib/validations/cereri";
import type { CerereStatusType } from "@/lib/validations/cereri";
import { formatDistanceToNow, format } from "date-fns";
import { ro } from "date-fns/locale";
import { ArrowRight, MessageSquare, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface CerereTimelineProps {
  cerereId: string;
  isStaff: boolean;
  className?: string;
}

/**
 * CerereTimeline Component
 * Renders a vertical timeline of cerere_istoric entries.
 *
 * - status_change: Shows old -> new status with badges
 * - nota_interna: Shows internal note (staff only)
 * - document_request: Shows requested documents list
 *
 * Data comes from useCerereTimeline hook which queries cerere_istoric
 * with visibility filtering based on user role.
 */
export function CerereTimeline({
  cerereId,
  isStaff,
  className,
}: CerereTimelineProps): React.ReactElement {
  const { data: entries, isLoading, isError } = useCerereTimeline(cerereId, isStaff);

  if (isLoading) {
    return <TimelineSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        Eroare la incarcarea istoricului
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-muted-foreground py-4 text-center text-sm">
        Nicio activitate inregistrata
      </div>
    );
  }

  return (
    <div className={cn("relative space-y-0", className)}>
      {/* Vertical line */}
      <div className="border-border/60 absolute top-2 bottom-2 left-4 border-l-2" />

      {entries.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          isStaff={isStaff}
          isLast={index === entries.length - 1}
        />
      ))}
    </div>
  );
}

interface TimelineEntryProps {
  entry: CerereIstoricEntry;
  isStaff: boolean;
  isLast: boolean;
}

function TimelineEntry({ entry, isStaff, isLast }: TimelineEntryProps): React.ReactElement {
  const entryDate = new Date(entry.created_at);
  const relativeTime = formatDistanceToNow(entryDate, { addSuffix: true, locale: ro });
  const absoluteTime = format(entryDate, "dd MMMM yyyy, HH:mm", { locale: ro });

  const iconMap: Record<CerereIstoricEntry["tip"], typeof ArrowRight> = {
    status_change: ArrowRight,
    nota_interna: MessageSquare,
    document_request: FileQuestion,
  };

  const colorMap: Record<CerereIstoricEntry["tip"], string> = {
    status_change: "bg-blue-500",
    nota_interna: "bg-amber-500",
    document_request: "bg-purple-500",
  };

  const Icon = iconMap[entry.tip];

  return (
    <div className={cn("relative flex gap-4 py-3 pl-1", !isLast && "pb-4")}>
      {/* Dot / icon */}
      <div
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-white",
          colorMap[entry.tip]
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        {/* Timestamp */}
        <p className="text-muted-foreground text-xs" title={absoluteTime}>
          {relativeTime}
        </p>

        {/* Entry content by type */}
        {entry.tip === "status_change" && <StatusChangeContent entry={entry} />}
        {entry.tip === "nota_interna" && <InternalNoteContent entry={entry} />}
        {entry.tip === "document_request" && <DocumentRequestContent entry={entry} />}

        {/* Actor name (staff view only) */}
        {isStaff && entry.actor?.prenume && (
          <p className="text-muted-foreground text-xs">
            de catre {entry.actor.prenume} {entry.actor.nume}
          </p>
        )}

        {/* Reason/motiv quote block */}
        {entry.motiv && entry.tip !== "nota_interna" && (
          <blockquote className="text-muted-foreground border-border/60 mt-1 border-l-2 pl-3 text-sm italic">
            {entry.motiv}
          </blockquote>
        )}
      </div>
    </div>
  );
}

function StatusChangeContent({ entry }: { entry: CerereIstoricEntry }): React.ReactElement {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-sm">
      <span>Status schimbat</span>
      {entry.old_status && (
        <>
          <span className="text-muted-foreground">din</span>
          <StatusBadge status={entry.old_status as CerereStatusType} className="text-xs" />
        </>
      )}
      {entry.new_status && (
        <>
          <span className="text-muted-foreground">in</span>
          <StatusBadge status={entry.new_status as CerereStatusType} className="text-xs" />
        </>
      )}
    </div>
  );
}

function InternalNoteContent({ entry }: { entry: CerereIstoricEntry }): React.ReactElement {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Nota interna</p>
      {entry.motiv && (
        <p className="rounded-md bg-amber-50 p-2 text-sm dark:bg-amber-950/20">{entry.motiv}</p>
      )}
    </div>
  );
}

function DocumentRequestContent({ entry }: { entry: CerereIstoricEntry }): React.ReactElement {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-purple-700 dark:text-purple-400">
        Documente solicitate
      </p>
      {entry.documente_solicitate && entry.documente_solicitate.length > 0 && (
        <ul className="space-y-1 text-sm">
          {entry.documente_solicitate.map((doc, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-muted-foreground mt-0.5 shrink-0">-</span>
              <div>
                <span className="font-medium">{doc.denumire}</span>
                {doc.motiv && <span className="text-muted-foreground"> - {doc.motiv}</span>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Skeleton loading state for the timeline
 */
function TimelineSkeleton(): React.ReactElement {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-4 pl-1">
          <div className="bg-muted size-8 shrink-0 animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="bg-muted h-3 w-24 animate-pulse rounded" />
            <div className="bg-muted h-4 w-48 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
