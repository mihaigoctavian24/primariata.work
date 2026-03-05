"use client";

import { motion } from "motion/react";
import { springTransition } from "@/lib/motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SidebarLogo } from "./SidebarLogo";
import { SidebarQuickSearch } from "./SidebarQuickSearch";
import { SidebarNav } from "./SidebarNav";
import { SidebarUserCard } from "./SidebarUserCard";
import type { SidebarConfig } from "./sidebar-config";

/**
 * Main Sidebar Component
 *
 * Desktop: motion.aside with collapse animation (260px <-> 72px)
 * Mobile (<1024px): shadcn Sheet overlay (always expanded inside)
 */

interface SidebarProps {
  config: SidebarConfig;
  collapsed: boolean;
  onToggle: () => void;
  onCommandPalette: () => void;
}

export function Sidebar({ config, collapsed, onToggle, onCommandPalette }: SidebarProps) {
  const isMobile = useMediaQuery("(max-width: 1023px)");

  // Mobile: render as Sheet
  if (isMobile) {
    return (
      <Sheet open={!collapsed} onOpenChange={() => onToggle()}>
        <SheetContent
          side="left"
          className="bg-sidebar-background text-sidebar-foreground w-[280px] p-0 [&>button]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigare</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <SidebarLogo collapsed={false} onToggle={onToggle} />
            <SidebarQuickSearch collapsed={false} onCommandPalette={onCommandPalette} />
            <SidebarNav config={config} collapsed={false} />
            <SidebarUserCard collapsed={false} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: animated aside
  return (
    <motion.aside
      className="border-sidebar-border bg-sidebar-background text-sidebar-foreground fixed inset-y-0 left-0 z-30 flex flex-col border-r"
      animate={{ width: collapsed ? 72 : 260 }}
      transition={springTransition}
    >
      <SidebarLogo collapsed={collapsed} onToggle={onToggle} />
      <SidebarQuickSearch collapsed={collapsed} onCommandPalette={onCommandPalette} />
      <SidebarNav config={config} collapsed={collapsed} />
      <SidebarUserCard collapsed={collapsed} />
    </motion.aside>
  );
}
