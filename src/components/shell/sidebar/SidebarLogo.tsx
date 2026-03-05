"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarLogoProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarLogo({ collapsed, onToggle }: SidebarLogoProps) {
  return (
    <div className="border-sidebar-border flex h-16 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
        {/* Icon mark -- always visible */}
        <span className="bg-sidebar-primary text-sidebar-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
          pT
        </span>
        {!collapsed && (
          <span className="text-sidebar-foreground text-sm font-semibold">primariaTa</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-7 w-7 shrink-0",
          collapsed && "mx-auto"
        )}
        onClick={onToggle}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </Button>
    </div>
  );
}
