"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarQuickSearchProps {
  collapsed: boolean;
  onCommandPalette: () => void;
}

export function SidebarQuickSearch({ collapsed, onCommandPalette }: SidebarQuickSearchProps) {
  if (collapsed) {
    return (
      <div className="px-3 py-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent h-9 w-9"
                onClick={onCommandPalette}
                aria-label="Cautare rapida (Cmd+K)"
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Cautare rapida (Cmd+K)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <button
        onClick={onCommandPalette}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-md px-3",
          "bg-sidebar-accent/50 text-sidebar-foreground/50",
          "text-sm transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 overflow-hidden text-left whitespace-nowrap">
          Cautare rapida...
        </span>
        <kbd className="border-sidebar-border bg-sidebar-background text-sidebar-foreground/50 pointer-events-none hidden shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium select-none sm:inline-block">
          Cmd+K
        </kbd>
      </button>
    </div>
  );
}
