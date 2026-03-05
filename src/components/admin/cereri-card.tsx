"use client";

import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";
import { fadeIn, defaultTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

type CereriStatus = "depusa" | "in_lucru" | "aprobata" | "respinsa" | "completata";

interface CereriCardProps {
  value: number;
  label: string;
  status: CereriStatus;
  className?: string;
}

const statusColorMap: Record<CereriStatus, { dot: string; label: string }> = {
  depusa: {
    dot: "bg-accent-500",
    label: "text-accent-500",
  },
  in_lucru: {
    dot: "bg-amber-500",
    label: "text-amber-600 dark:text-amber-400",
  },
  aprobata: {
    dot: "bg-emerald-500",
    label: "text-emerald-600 dark:text-emerald-400",
  },
  respinsa: {
    dot: "bg-destructive",
    label: "text-destructive",
  },
  completata: {
    dot: "bg-muted-foreground",
    label: "text-muted-foreground",
  },
};

const statusLabelMap: Record<CereriStatus, string> = {
  depusa: "Depusa",
  in_lucru: "In lucru",
  aprobata: "Aprobata",
  respinsa: "Respinsa",
  completata: "Completata",
};

function CereriCard({ value, label, status, className }: CereriCardProps) {
  const colors = statusColorMap[status];

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
      className={cn(
        "border-border/40 bg-card rounded-xl border p-4 text-center shadow-sm",
        className
      )}
    >
      <AnimatedCounter
        target={value}
        duration={1200}
        className="text-foreground block text-3xl leading-tight font-bold"
      />
      <span className="text-muted-foreground mt-1 block text-xs">{label}</span>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <span className={cn("inline-block h-2 w-2 rounded-full", colors.dot)} />
        <span className={cn("text-xs font-medium", colors.label)}>{statusLabelMap[status]}</span>
      </div>
    </motion.div>
  );
}

export { CereriCard };
export type { CereriCardProps, CereriStatus };
