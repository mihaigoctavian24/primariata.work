"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  X,
  FileEdit,
  Upload,
  CreditCard,
  Download,
  MessageSquare,
  Eye,
  AlertCircle,
  Clock,
} from "lucide-react";
import type { NextStep, NextStepType } from "@/types/dashboard";

interface NextStepsWidgetProps {
  steps: NextStep[];
  maxDisplay?: number;
  onStepClick?: (step: NextStep) => void;
  onDismiss?: (stepId: string) => void;
}

/**
 * Next Steps Widget - Recommended Actions
 *
 * Intelligent recommendations for what users should do next:
 * - Complete draft cereri
 * - Upload missing documents
 * - Pay pending fees
 * - Download approved documents
 * - Provide feedback
 * - Review status updates
 *
 * Features:
 * - Priority-based ordering
 * - Deadline indicators
 * - Click-to-action
 * - Dismissible items
 * - Animated transitions
 */
export function NextStepsWidget({
  steps,
  maxDisplay = 5,
  onStepClick,
  onDismiss,
}: NextStepsWidgetProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Filter and sort steps
  const activeSteps = steps
    .filter((step) => !dismissed.has(step.id))
    .sort((a, b) => {
      // Sort by priority (1 = highest)
      if (a.priority !== b.priority) return a.priority - b.priority;

      // Then by deadline (nearest first)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;

      return 0;
    })
    .slice(0, maxDisplay);

  const handleDismiss = (stepId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDismissed((prev) => new Set(prev).add(stepId));
    onDismiss?.(stepId);
  };

  if (activeSteps.length === 0) {
    return (
      <div className="border-border/40 bg-card rounded-lg border p-6 text-center shadow-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
            <AlertCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-foreground font-medium">Totul la zi!</p>
            <p className="text-muted-foreground text-sm">
              Nu există acțiuni urgente în acest moment
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-border/40 bg-card space-y-3 rounded-lg border p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-foreground font-semibold">Următorii Pași</h3>
          <p className="text-muted-foreground text-sm">
            {activeSteps.length}{" "}
            {activeSteps.length === 1 ? "acțiune recomandată" : "acțiuni recomandate"}
          </p>
        </div>
      </div>

      {/* Steps list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activeSteps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              index={index}
              onClick={() => onStepClick?.(step)}
              onDismiss={onDismiss ? (e) => handleDismiss(step.id, e) : undefined}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Individual step card
 */
function StepCard({
  step,
  onClick,
  onDismiss,
}: {
  step: NextStep;
  index: number;
  onClick?: () => void;
  onDismiss?: (event: React.MouseEvent) => void;
}) {
  const config = getStepConfig(step.type);
  const hasDeadline = step.deadline && new Date(step.deadline) > new Date();
  const isUrgent = step.priority <= 2;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`group border-border/40 hover:border-primary/50 relative flex items-start gap-3 rounded-lg border p-3 transition-all hover:shadow-md ${onClick ? "hover:bg-muted/30 cursor-pointer" : ""} ${isUrgent ? "border-orange-500/30 bg-orange-500/10" : "bg-background"} `}
    >
      {/* Priority indicator */}
      {isUrgent && <div className="absolute top-0 left-0 h-full w-1 rounded-l-lg bg-orange-500" />}

      {/* Icon */}
      <div className={`mt-0.5 rounded-md p-1.5 ${config.iconBgColor}`}>{config.icon}</div>

      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-foreground text-sm font-medium">{step.title}</h4>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Ascunde sugestie"
            >
              <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
            </button>
          )}
        </div>

        <p className="text-muted-foreground text-xs">{step.description}</p>

        {/* Deadline indicator */}
        {hasDeadline && (
          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <Clock className="h-3 w-3" />
            <span>Termen limită: {new Date(step.deadline!).toLocaleDateString("ro-RO")}</span>
          </div>
        )}
      </div>

      {/* Action arrow */}
      {onClick && (
        <ChevronRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-transform group-hover:translate-x-1" />
      )}
    </motion.div>
  );
}

/**
 * Get visual configuration for step type
 */
function getStepConfig(type: NextStepType) {
  const configs: Record<
    NextStepType,
    {
      icon: React.ReactNode;
      iconBgColor: string;
    }
  > = {
    complete_draft: {
      icon: <FileEdit className="h-4 w-4" />,
      iconBgColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    },
    upload_documents: {
      icon: <Upload className="h-4 w-4" />,
      iconBgColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    },
    pay_pending: {
      icon: <CreditCard className="h-4 w-4" />,
      iconBgColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    },
    download_approved: {
      icon: <Download className="h-4 w-4" />,
      iconBgColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    },
    provide_feedback: {
      icon: <MessageSquare className="h-4 w-4" />,
      iconBgColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    review_status: {
      icon: <Eye className="h-4 w-4" />,
      iconBgColor: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    },
    action_required: {
      icon: <AlertCircle className="h-4 w-4" />,
      iconBgColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    },
  };

  return configs[type] || configs.action_required;
}
