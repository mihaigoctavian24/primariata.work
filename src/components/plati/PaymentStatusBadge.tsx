import { Badge } from "@/components/ui/badge";
import { PlataStatus } from "@/lib/validations/plati";
import { CheckCircle2, Clock, Loader2, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * PaymentStatusBadge Component
 * Displays a colored badge for payment status with proper Romanian labels and icons
 * Theme-adaptive design without borders
 *
 * Status colors (theme-adaptive):
 * - success: green with CheckCircle2 icon
 * - pending: yellow with Clock icon
 * - processing: blue with Loader2 icon
 * - failed: red with XCircle icon
 * - refunded: gray with RotateCcw icon
 */
export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case PlataStatus.SUCCESS:
        return {
          label: "Plătit",
          icon: CheckCircle2,
          className: "bg-green-500/10 text-green-700 dark:text-green-400",
        };
      case PlataStatus.PENDING:
        return {
          label: "În așteptare",
          icon: Clock,
          className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
        };
      case PlataStatus.PROCESSING:
        return {
          label: "În procesare",
          icon: Loader2,
          className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
        };
      case PlataStatus.FAILED:
        return {
          label: "Eșuat",
          icon: XCircle,
          className: "bg-red-500/10 text-red-700 dark:text-red-400",
        };
      case PlataStatus.REFUNDED:
        return {
          label: "Rambursat",
          icon: RotateCcw,
          className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
        };
      default:
        return {
          label: status,
          icon: Clock,
          className: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, "border-0", className)} variant="outline">
      <Icon className="mr-1.5 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
