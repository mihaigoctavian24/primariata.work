"use client";

import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
            <SidebarLogo collapsed={false} />
            <SidebarQuickSearch collapsed={false} onCommandPalette={onCommandPalette} />
            <SidebarNav config={config} collapsed={false} />
            <SidebarUserCard collapsed={false} roleLabel={config.roleLabel} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: animated aside
  return (
    <motion.aside
      className="border-sidebar-border text-sidebar-foreground bg-sidebar-background fixed inset-y-0 left-0 z-30 flex flex-col border-r dark:[background:linear-gradient(180deg,#0c0c18,#08080f)]"
      animate={{ width: collapsed ? 72 : 260 }}
      transition={springTransition}
    >
      <SidebarLogo collapsed={collapsed} />
      <SidebarQuickSearch collapsed={collapsed} onCommandPalette={onCommandPalette} />
      <SidebarNav config={config} collapsed={collapsed} />
      <SidebarUserCard collapsed={collapsed} roleLabel={config.roleLabel} />
      <div className="px-3 pb-4">
        <button
          onClick={onToggle}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white/[0.03] px-3 py-2 text-gray-500 transition-all hover:bg-white/[0.06] hover:text-gray-300"
          style={{ border: "1px solid rgba(255,255,255,0.04)" }}
          aria-label={collapsed ? "Extinde sidebar" : "Restrânge sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span style={{ fontSize: "0.78rem" }}>Restrânge</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
