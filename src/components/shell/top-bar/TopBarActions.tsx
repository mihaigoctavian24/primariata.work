"use client";

import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { WeatherWidgetMinimal } from "@/components/weather/WeatherWidgetMinimal";
import { createClient } from "@/lib/supabase/client";
import type { SidebarConfig } from "@/components/shell/sidebar/sidebar-config";

interface TopBarActionsProps {
  config: SidebarConfig;
  onCommandPalette: () => void;
  onNotifications: () => void;
  unreadCount?: number;
}

interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

function getInitials(name: string, email: string): string {
  if (name) {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function TopBarActions({
  config,
  onCommandPalette,
  onNotifications,
  unreadCount = 0,
}: TopBarActionsProps) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) return;
      const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || "";
      const email = authUser.email || "";
      setUser({
        name,
        email,
        avatarUrl: authUser.user_metadata?.avatar_url,
        initials: getInitials(name, email),
      });
    });
  }, []);

  return (
    <div className="flex items-center gap-1">
      {/* Role badge */}
      <Badge variant="secondary" className="mr-1 hidden sm:inline-flex">
        {config.roleLabel}
      </Badge>

      {/* Weather widget -- hidden on small screens */}
      <WeatherWidgetMinimal className="hidden md:flex" />

      {/* Command palette trigger */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onCommandPalette}
              aria-label="Cautare (Cmd+K)"
            >
              <Search className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cautare (Cmd+K)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Notification bell */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotifications}
              aria-label="Notificari"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Notificari</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User avatar */}
      {user && (
        <Avatar className="h-8 w-8">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />}
          <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
