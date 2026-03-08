"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type UserRoleTab = "all" | "cetatean" | "functionar" | "primar" | "admin";

interface TabConfig {
  key: UserRoleTab;
  label: string;
}

const TABS: TabConfig[] = [
  { key: "all", label: "Toți" },
  { key: "cetatean", label: "Cetățeni" },
  { key: "functionar", label: "Funcționari" },
  { key: "primar", label: "Primar" },
  { key: "admin", label: "Admin" },
];

interface UserRoleTabsProps {
  activeRole: string;
  onRoleChange: (role: string) => void;
  counts: Record<string, number>;
}

// ============================================================================
// Component
// ============================================================================

export function UserRoleTabs({
  activeRole,
  onRoleChange,
  counts,
}: UserRoleTabsProps): React.ReactElement {
  return (
    <div className="flex items-center gap-0.5 border-b border-white/[0.06]">
      {TABS.map((tab) => {
        const isActive = activeRole === tab.key;
        const count = counts[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onRoleChange(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors duration-150 select-none",
              isActive ? "text-white" : "text-white/40 hover:text-white/70"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0 text-[10px] leading-4 font-semibold tabular-nums",
                isActive ? "bg-accent-500/20 text-accent-500" : "bg-white/[0.06] text-white/40"
              )}
            >
              {count}
            </span>

            {/* Animated active indicator */}
            {isActive && (
              <motion.div
                layoutId="role-tab-indicator"
                className="bg-accent-500 absolute right-0 bottom-0 left-0 h-[2px] rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
