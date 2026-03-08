"use client";

import { Menu, ShieldCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TopBarActions } from "./TopBarActions";
import { WeatherWidgetMinimal } from "@/components/weather/WeatherWidgetMinimal";
import type { SidebarConfig } from "@/components/shell/sidebar/sidebar-config";

interface TopBarProps {
  config: SidebarConfig;
  onMenuClick: () => void;
  onCommandPalette: () => void;
  onNotifications: () => void;
  unreadCount?: number;
}

function toLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatLocation(basePath: string): string {
  const parts = basePath.split("/").filter(Boolean);
  // parts: ["app", "judet", "localitate", "role"]
  if (parts.length >= 3) {
    return `${toLabel(parts[2] ?? "")}, ${toLabel(parts[1] ?? "")}`;
  }
  return "";
}

export function TopBar({
  config,
  onMenuClick,
  onCommandPalette,
  onNotifications,
  unreadCount,
}: TopBarProps) {
  const location = formatLocation(config.basePath);

  return (
    <header className="bg-background sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/[0.04] px-4">
      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Hamburger — mobile only */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Role badge + Location + Weather — desktop only */}
        <div className="hidden items-center gap-4 lg:flex">
          {/* Role badge pill */}
          <div
            className="flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[0.7rem] font-semibold"
            style={{
              background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.05))",
              borderColor: "rgba(236,72,153,0.1)",
            }}
          >
            <ShieldCheck className="h-3 w-3 text-pink-400" />
            <span className="text-pink-400/80">{config.roleLabel}</span>
          </div>

          {/* Location pill */}
          {location && (
            <button className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.04] px-3 py-1.5 transition-all hover:bg-white/[0.07]">
              <MapPin className="h-3.5 w-3.5 text-pink-400" />
              <span className="text-[0.82rem] text-gray-200">{location}</span>
            </button>
          )}

          {/* Weather widget */}
          <WeatherWidgetMinimal className="hidden md:flex" />
        </div>
      </div>

      {/* Right side: action buttons */}
      <TopBarActions
        onCommandPalette={onCommandPalette}
        onNotifications={onNotifications}
        unreadCount={unreadCount}
      />
    </header>
  );
}
