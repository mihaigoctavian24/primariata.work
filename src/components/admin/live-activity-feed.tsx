"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { slideIn, springTransition } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
}

interface LiveActivityFeedProps {
  items: ActivityItem[];
  maxVisible?: number;
  className?: string;
}

const typeColorMap = {
  info: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
  success: {
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  error: {
    iconBg: "bg-destructive/15",
    iconColor: "text-destructive",
  },
} as const;

function LiveActivityFeed({ items, maxVisible = 5, className }: LiveActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when new items are added
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [items.length]);

  const itemHeight = 56; // approximate height per item in px

  return (
    <Card className={cn("overflow-hidden p-4", className)}>
      <div
        ref={containerRef}
        className="flex flex-col gap-1 overflow-y-auto"
        style={{ maxHeight: maxVisible * itemHeight }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item) => {
            const Icon = item.icon;
            const colors = typeColorMap[item.type];

            return (
              <motion.div
                key={item.id}
                layout
                variants={slideIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, height: 0 }}
                transition={springTransition}
                className="hover:bg-muted/50 flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors"
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                    colors.iconBg
                  )}
                >
                  <Icon className={cn("h-3 w-3", colors.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm">{item.title}</p>
                  <p className="text-muted-foreground truncate text-xs">{item.description}</p>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    <span className="text-[0.65rem]">{item.timestamp}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}

export { LiveActivityFeed };
export type { LiveActivityFeedProps, ActivityItem };
