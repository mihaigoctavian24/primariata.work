import { Badge } from "@/components/ui/badge";
import { getCerereStatusLabel, getCerereStatusColor } from "@/lib/validations/cereri";
import type { CerereStatusType } from "@/lib/validations/cereri";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CerereStatusType;
  className?: string;
}

/**
 * StatusBadge Component
 * Displays a colored badge for cerere status with proper Romanian labels
 *
 * Status colors:
 * - depusa: blue
 * - in_verificare: yellow
 * - info_suplimentare: orange
 * - in_procesare: purple
 * - aprobata: green
 * - respinsa: red
 * - anulata: gray
 * - finalizata: emerald
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = getCerereStatusLabel(status);
  const colorClass = getCerereStatusColor(status);

  return (
    <Badge className={cn(colorClass, "border-0", className)} variant="outline">
      {label}
    </Badge>
  );
}
