"use client";

import { Badge } from "@/components/ui/badge";
import { calculateSla } from "@/lib/cereri/sla";
import type { SlaStatus } from "@/lib/cereri/sla";
import { Clock, AlertTriangle, CheckCircle, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlaIndicatorProps {
  dataTermen: string | null;
  status: string;
  totalPausedDays?: number;
  className?: string;
  showDays?: boolean;
}

const SLA_CONFIG: Record<
  Exclude<SlaStatus, "none">,
  {
    icon: typeof CheckCircle;
    colorClass: string;
    dotClass: string;
  }
> = {
  green: {
    icon: CheckCircle,
    colorClass: "bg-green-500/10 text-green-700 dark:text-green-400",
    dotClass: "bg-green-500",
  },
  yellow: {
    icon: AlertTriangle,
    colorClass: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    dotClass: "bg-yellow-500",
  },
  red: {
    icon: AlertTriangle,
    colorClass: "bg-red-500/10 text-red-700 dark:text-red-400",
    dotClass: "bg-red-500",
  },
  paused: {
    icon: Pause,
    colorClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    dotClass: "bg-orange-500",
  },
};

/**
 * SlaIndicator Component
 * Renders a traffic light SLA badge showing cerere deadline status.
 *
 * - green: on track (>5 days remaining)
 * - yellow: at risk (1-5 days remaining)
 * - red: overdue (past deadline)
 * - paused: waiting for citizen (info_suplimentare)
 * - none: no deadline set (renders nothing)
 */
export function SlaIndicator({
  dataTermen,
  status,
  totalPausedDays,
  className,
  showDays = false,
}: SlaIndicatorProps): React.ReactElement | null {
  const slaInfo = calculateSla(dataTermen, status, totalPausedDays);

  if (slaInfo.status === "none") {
    return null;
  }

  const config = SLA_CONFIG[slaInfo.status];
  const Icon = config.icon;

  function getLabel(): string {
    switch (slaInfo.status) {
      case "green":
        return showDays && slaInfo.daysRemaining !== null
          ? `${slaInfo.daysRemaining} zile ramase`
          : "La termen";
      case "yellow":
        return slaInfo.daysRemaining !== null
          ? `${slaInfo.daysRemaining} ${slaInfo.daysRemaining === 1 ? "zi ramasa" : "zile ramase"}`
          : "Urgent";
      case "red": {
        const overdueDays = slaInfo.daysRemaining !== null ? Math.abs(slaInfo.daysRemaining) : 0;
        return showDays && overdueDays > 0
          ? `Depasit cu ${overdueDays} ${overdueDays === 1 ? "zi" : "zile"}`
          : "Depasit";
      }
      case "paused":
        return "In asteptare";
      default:
        return "";
    }
  }

  return (
    <Badge className={cn(config.colorClass, "gap-1 border-0", className)} variant="outline">
      <Icon className="size-3" aria-hidden="true" />
      <span>{getLabel()}</span>
    </Badge>
  );
}

/**
 * Compact SLA dot indicator for mobile/compact views.
 * Shows only a colored dot without text.
 */
export function SlaIndicatorDot({
  dataTermen,
  status,
  totalPausedDays,
  className,
}: Omit<SlaIndicatorProps, "showDays">): React.ReactElement | null {
  const slaInfo = calculateSla(dataTermen, status, totalPausedDays);

  if (slaInfo.status === "none") {
    return null;
  }

  const config = SLA_CONFIG[slaInfo.status];

  const titleMap: Record<Exclude<SlaStatus, "none">, string> = {
    green: "La termen",
    yellow: `${slaInfo.daysRemaining ?? 0} zile ramase`,
    red: "Depasit termen",
    paused: "In asteptare",
  };

  return (
    <span
      className={cn("inline-block size-2.5 rounded-full", config.dotClass, className)}
      title={titleMap[slaInfo.status]}
      aria-label={titleMap[slaInfo.status]}
    />
  );
}
