"use client";

import { ReactNode, useState } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { TrendingUp, TrendingDown, Minus, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cardHover, scaleOnHover, fadeIn } from "@/lib/animations";
import { useMetricAnimation } from "@/hooks/useMetricAnimation";
import { cn } from "@/lib/utils";

export type TrendDirection = "up" | "down" | "stable";
export type ColorScheme = "blue" | "green" | "purple" | "orange" | "red";

export interface SparklineDataPoint {
  value: number;
  label?: string;
}

export interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  trend?: TrendDirection;
  sparklineData?: SparklineDataPoint[];
  onClick?: () => void;
  icon?: ReactNode;
  colorScheme?: ColorScheme;
  isLoading?: boolean;
  className?: string;
  description?: string;
  format?: "number" | "percentage" | "currency";
  prefix?: string;
  suffix?: string;
}

const colorSchemes: Record<
  ColorScheme,
  {
    iconBg: string;
    iconColor: string;
    textColor: string;
    sparklineColor: string;
  }
> = {
  blue: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-700 dark:text-blue-400",
    sparklineColor: "#3b82f6",
  },
  green: {
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-700 dark:text-green-400",
    sparklineColor: "#10b981",
  },
  purple: {
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
    textColor: "text-purple-700 dark:text-purple-400",
    sparklineColor: "#a855f7",
  },
  orange: {
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
    textColor: "text-orange-700 dark:text-orange-400",
    sparklineColor: "#f97316",
  },
  red: {
    iconBg: "bg-red-500/10",
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-700 dark:text-red-400",
    sparklineColor: "#ef4444",
  },
};

export function MetricCard({
  title,
  value,
  previousValue,
  trend,
  sparklineData,
  onClick,
  icon,
  colorScheme = "blue",
  isLoading = false,
  className,
  description,
  format = "number",
  prefix = "",
  suffix = "",
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = colorSchemes[colorScheme];

  // Calculate percentage change
  const percentageChange =
    previousValue && previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0;

  // Determine trend icon
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  // Format value based on type
  let displaySuffix = suffix;
  let displayPrefix = prefix;
  if (format === "percentage") {
    displaySuffix = "%";
  } else if (format === "currency") {
    displayPrefix = "RON ";
  }

  // Animate the metric value
  const { formattedValue } = useMetricAnimation(value, {
    duration: 1000,
    decimals: format === "percentage" ? 1 : 0,
    prefix: displayPrefix,
    suffix: displaySuffix,
  });

  if (isLoading) {
    return (
      <div
        className={cn(
          "border-border bg-card animate-pulse rounded-lg border p-6 shadow-sm",
          className
        )}
      >
        <div className="bg-muted mb-2 h-4 w-24 rounded" />
        <div className="bg-muted mb-2 h-8 w-32 rounded" />
        <div className="bg-muted h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      variants={cardHover}
      initial="initial"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "group border-border bg-card relative cursor-pointer overflow-hidden rounded-lg border shadow-sm transition-all hover:shadow-md",
        onClick && "hover:scale-[1.01]",
        className
      )}
      style={{ willChange: "transform, box-shadow" }}
      role={onClick ? "button" : undefined}
      aria-label={onClick ? `View details for ${title}` : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className={cn("text-sm font-medium", colors.textColor)}>{title}</h3>
            {description && <p className="text-muted-foreground mt-1 text-xs">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            {icon && (
              <div className={cn("rounded-full p-2", colors.iconBg)}>
                <div className={cn("h-4 w-4", colors.iconColor)}>{icon}</div>
              </div>
            )}
            {onClick && (
              <motion.div variants={scaleOnHover} whileHover="hover" whileTap="tap">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Value */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-2 flex items-baseline gap-2"
        >
          <span className="text-foreground text-3xl font-bold">{formattedValue}</span>
        </motion.div>

        {/* Comparison Badge */}
        {previousValue !== undefined && percentageChange !== 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge
              variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
              className="gap-1 text-xs"
            >
              <TrendIcon className="h-3 w-3" />
              <span>{Math.abs(percentageChange).toFixed(1)}%</span>
            </Badge>
          </motion.div>
        )}

        {/* Sparkline Chart */}
        {sparklineData && sparklineData.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0.7 }}
            transition={{ duration: 0.3 }}
            className="mt-4 h-16"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null;
                    return (
                      <div className="bg-card rounded-lg border p-2 shadow-lg">
                        <p className="text-xs font-medium">{payload[0].payload.label || "Value"}</p>
                        <p className="text-primary text-sm font-bold">
                          {displayPrefix}
                          {payload[0].value}
                          {displaySuffix}
                        </p>
                      </div>
                    );
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={colors.sparklineColor}
                  strokeWidth={2}
                  fill="transparent"
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

MetricCard.displayName = "MetricCard";
