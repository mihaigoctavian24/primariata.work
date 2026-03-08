"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Users,
  FileText,
  FolderOpen,
  CreditCard,
  CalendarDays,
  Settings,
  Bell,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem, IconName } from "./sidebar-config";

/** Maps string icon names from sidebar config to actual Lucide components. */
const ICON_MAP: Record<IconName, LucideIcon> = {
  LayoutDashboard,
  Activity,
  Users,
  FileText,
  FolderOpen,
  CreditCard,
  CalendarDays,
  Settings,
  Bell,
  User,
};

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  const Icon = ICON_MAP[item.icon];

  const content = (
    <Link
      href={item.href}
      className={cn(
        "group relative inline-flex items-center gap-3 rounded-xl px-3 py-2 font-medium transition-all",
        isActive ? "text-white" : "text-gray-500 hover:text-gray-200",
        collapsed ? "w-full justify-center" : "w-auto"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.08))",
            border: "1px solid rgba(236,72,153,0.15)",
          }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <div className="relative z-10 shrink-0">
        <Icon
          className={cn(
            "h-[17px] w-[17px] shrink-0 transition-colors",
            isActive && "text-pink-400"
          )}
        />
      </div>
      {collapsed && item.badge !== undefined && (
        <span className="absolute top-0.5 right-0.5 z-20 h-2 w-2 rounded-full bg-pink-500" />
      )}
      {!collapsed && (
        <>
          <span className="relative z-10 whitespace-nowrap" style={{ fontSize: "0.82rem" }}>
            {item.label}
          </span>
          {typeof item.badge === "number" && (
            <span
              className="relative z-10 ml-1.5 min-w-[20px] rounded-full text-center text-white"
              style={{
                fontSize: "0.63rem",
                background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                padding: "1px 7px",
              }}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}
