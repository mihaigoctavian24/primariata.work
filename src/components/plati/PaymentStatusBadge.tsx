import { Badge } from "@/components/ui/badge";
import { PlataStatus } from "@/lib/validations/plati";
import { CheckCircle2, Clock, Loader2, XCircle, RotateCcw } from "lucide-react";

interface PaymentStatusBadgeProps {
  status: string;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case PlataStatus.SUCCESS:
        return {
          label: "Plătit",
          variant: "default" as const,
          icon: CheckCircle2,
          className:
            "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400",
        };
      case PlataStatus.PENDING:
        return {
          label: "În așteptare",
          variant: "secondary" as const,
          icon: Clock,
          className:
            "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400",
        };
      case PlataStatus.PROCESSING:
        return {
          label: "În procesare",
          variant: "outline" as const,
          icon: Loader2,
          className:
            "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400",
        };
      case PlataStatus.FAILED:
        return {
          label: "Eșuat",
          variant: "destructive" as const,
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400",
        };
      case PlataStatus.REFUNDED:
        return {
          label: "Rambursat",
          variant: "outline" as const,
          icon: RotateCcw,
          className:
            "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400",
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          icon: Clock,
          className: "",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ""}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
