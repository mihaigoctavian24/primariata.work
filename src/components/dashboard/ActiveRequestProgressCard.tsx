"use client";

import { motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";
import type { ActiveRequestProgressCardProps } from "@/types/dashboard";

/**
 * Active Request Progress Card - Individual Cerere Display
 *
 * Detailed card showing:
 * - Cerere number and type
 * - Current status with visual indicator
 * - Progress percentage with bar
 * - ETA days remaining
 * - Last activity timestamp
 * - Action buttons (View Details, Contact)
 *
 * Features:
 * - Animated progress bars
 * - Status-based color coding
 * - Hover interactions
 * - Click handlers for navigation
 * - Responsive layout
 */
export function ActiveRequestProgressCard({
  cerere,
  onViewDetails,
  onContact,
}: ActiveRequestProgressCardProps) {
  const { progress, status, numar_cerere, tip_cerere } = cerere;
  const statusConfig = getStatusConfig(status);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group border-border/40 bg-card rounded-lg border p-5 shadow-sm transition-all hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <FileText className="text-muted-foreground h-4 w-4" />
            <h3 className="text-foreground font-semibold">{numar_cerere}</h3>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">{tip_cerere.nume}</p>
        </div>

        {/* Status badge */}
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${statusConfig.badgeClass}`}
        >
          {statusConfig.icon}
          <span className="text-xs font-medium">{statusConfig.label}</span>
        </div>
      </div>

      {/* Progress section */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progres</span>
          <span className="text-foreground font-semibold">{progress.percentage}%</span>
        </div>

        {/* Progress bar */}
        <div className="bg-muted relative h-2.5 w-full overflow-hidden rounded-full">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`h-full rounded-full ${statusConfig.progressColor}`}
          />
        </div>

        {/* ETA and last activity */}
        <div className="text-muted-foreground flex items-center justify-between text-xs">
          {progress.eta_days !== null ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                ~{progress.eta_days} {progress.eta_days === 1 ? "zi" : "zile"} rămase
              </span>
            </div>
          ) : (
            <span>În procesare</span>
          )}

          {progress.last_activity && (
            <span>Actualizat: {new Date(progress.last_activity).toLocaleDateString("ro-RO")}</span>
          )}
        </div>
      </div>

      {/* Timeline events (if available) */}
      {progress.timeline && progress.timeline.length > 0 && (
        <div className="border-border mb-4 space-y-2 border-t pt-3">
          <p className="text-muted-foreground text-xs font-medium">Istoric Recent</p>
          <div className="space-y-1.5">
            {progress.timeline.slice(0, 2).map((event, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs">
                <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                <div className="flex-1">
                  <p className="text-foreground">{event.status}</p>
                  <p className="text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString("ro-RO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {event.actor && ` • ${event.actor}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(cerere.id)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors"
          >
            Vezi Detalii
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}

        {onContact && (
          <button
            onClick={() => onContact(cerere.id)}
            className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center gap-1.5 rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            title="Contactează primăria"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Warning indicator for delayed cereri */}
      {progress.eta_days !== null && progress.eta_days <= 2 && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-orange-500/30 bg-orange-500/10 p-2 dark:bg-orange-500/20">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Aproape de termen limită estimat. Verificați statusul pentru actualizări.
          </p>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Get status configuration (colors, icons, labels)
 */
function getStatusConfig(status: string) {
  const configs: Record<
    string,
    {
      label: string;
      badgeClass: string;
      progressColor: string;
      icon: React.ReactNode;
    }
  > = {
    draft: {
      label: "Ciornă",
      badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
      progressColor: "bg-gray-500",
      icon: <FileText className="h-3 w-3" />,
    },
    depusa: {
      label: "Depusă",
      badgeClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      progressColor: "bg-blue-500",
      icon: <Clock className="h-3 w-3" />,
    },
    in_verificare: {
      label: "În Verificare",
      badgeClass: "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400",
      progressColor: "bg-yellow-500",
      icon: <Clock className="h-3 w-3" />,
    },
    in_asteptare: {
      label: "În Așteptare",
      badgeClass: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      progressColor: "bg-orange-500",
      icon: <Clock className="h-3 w-3" />,
    },
    in_aprobare: {
      label: "În Aprobare",
      badgeClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      progressColor: "bg-purple-500",
      icon: <Clock className="h-3 w-3" />,
    },
    aprobat: {
      label: "Aprobată",
      badgeClass: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      progressColor: "bg-green-500",
      icon: <CheckCircle className="h-3 w-3" />,
    },
    respins: {
      label: "Respinsă",
      badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      progressColor: "bg-red-500",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    anulat: {
      label: "Anulată",
      badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
      progressColor: "bg-gray-500",
      icon: <AlertTriangle className="h-3 w-3" />,
    },
  };

  return (
    configs[status] || {
      label: status,
      badgeClass: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
      progressColor: "bg-gray-500",
      icon: <FileText className="h-3 w-3" />,
    }
  );
}
