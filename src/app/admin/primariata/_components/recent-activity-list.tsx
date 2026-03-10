"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

export interface ActivityItem {
  id: string;
  action: string;
  detail: string;
  time: string;
  color: string;
  icon: LucideIcon;
}

interface RecentActivityListProps {
  activities: ActivityItem[];
}

export function RecentActivityList({ activities }: RecentActivityListProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="col-span-4 rounded-2xl p-5"
      style={{ background: "var(--muted)", border: "1px solid var(--border-subtle)" }}
    >
      <h3 className="text-foreground mb-4 text-[0.95rem] font-semibold">Activitate Recentă</h3>
      <div className="space-y-3">
        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${act.color}15`, border: `1px solid ${act.color}20` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: act.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-foreground text-[0.78rem]">{act.action}</div>
                <div className="text-muted-foreground text-[0.68rem]">{act.detail}</div>
              </div>
              <span className="text-muted-foreground shrink-0 text-[0.65rem]">{act.time}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
