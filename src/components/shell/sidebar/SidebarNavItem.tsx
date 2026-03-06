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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
        isActive &&
          "bg-sidebar-primary/10 text-sidebar-primary before:bg-sidebar-primary before:absolute before:inset-y-1 before:left-0 before:w-[3px] before:rounded-full",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 overflow-hidden whitespace-nowrap">{item.label}</span>
          {item.badge !== undefined && (
            <Badge
              variant="secondary"
              className="ml-auto h-5 min-w-5 shrink-0 justify-center px-1 text-[10px]"
            >
              {item.badge === "dynamic" ? "..." : item.badge}
            </Badge>
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
