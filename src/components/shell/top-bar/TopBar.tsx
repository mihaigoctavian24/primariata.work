"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBarActions } from "./TopBarActions";
import type { SidebarConfig } from "@/components/shell/sidebar/sidebar-config";

/**
 * Top Bar Component
 *
 * Sticky header: hamburger (mobile), spacer/breadcrumb area, action buttons.
 */

interface TopBarProps {
  config: SidebarConfig;
  onMenuClick: () => void;
  onCommandPalette: () => void;
  onNotifications: () => void;
}

export function TopBar({ config, onMenuClick, onCommandPalette, onNotifications }: TopBarProps) {
  return (
    <header className="border-border bg-background sticky top-0 z-20 flex h-16 items-center justify-between border-b px-4">
      {/* Left side: hamburger menu (mobile only) */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right side: action buttons */}
      <TopBarActions
        config={config}
        onCommandPalette={onCommandPalette}
        onNotifications={onNotifications}
      />
    </header>
  );
}
