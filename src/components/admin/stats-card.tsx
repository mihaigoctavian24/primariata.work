"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedCounter } from "./animated-counter";
import { slideIn, defaultTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  value: number;
  label: string;
  trend?: { value: number; isPositive: boolean };
  colorVariant?: "default" | "accent" | "success" | "warning" | "destructive";
  className?: string;
}

const colorVariantMap = {
  default: {
    card: "",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    trendPositive: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    trendNegative: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
  },
  accent: {
    card: "bg-accent-50 dark:bg-accent-950",
    iconBg: "bg-accent-100 dark:bg-accent-900",
    iconColor: "text-accent-600 dark:text-accent-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    trendNegative: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
  },
  success: {
    card: "bg-emerald-50 dark:bg-emerald-950/30",
    iconBg: "bg-emerald-100 dark:bg-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    trendPositive:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-900/50",
    trendNegative: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
  },
  warning: {
    card: "bg-amber-50 dark:bg-amber-950/30",
    iconBg: "bg-amber-100 dark:bg-amber-900",
    iconColor: "text-amber-600 dark:text-amber-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    trendNegative: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
  },
  destructive: {
    card: "bg-destructive/10",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
    trendPositive: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    trendNegative: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
  },
} as const;

function StatsCard({
  icon: Icon,
  value,
  label,
  trend,
  colorVariant = "default",
  className,
}: StatsCardProps) {
  const colors = colorVariantMap[colorVariant];
  const TrendIcon = trend?.isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={defaultTransition}
    >
      <Card className={cn("relative overflow-hidden p-4", colors.card, className)}>
        <div className="mb-3 flex items-center justify-between">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", colors.iconBg)}>
            <Icon className={cn("h-4 w-4", colors.iconColor)} />
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                trend.isPositive ? colors.trendPositive : colors.trendNegative
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <AnimatedCounter
          target={value}
          duration={1500}
          className="text-foreground block text-3xl leading-tight font-bold"
        />
        <span className="text-muted-foreground mt-1 block text-xs">{label}</span>
      </Card>
    </motion.div>
  );
}

export { StatsCard };
export type { StatsCardProps };
