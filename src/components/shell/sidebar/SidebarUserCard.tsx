"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserInfo {
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
}

interface SidebarUserCardProps {
  collapsed: boolean;
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

export function SidebarUserCard({ collapsed }: SidebarUserCardProps) {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!mounted || !authUser) return;
      const name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || "";
      const email = authUser.email || "";
      setUser({
        name,
        email,
        avatarUrl: authUser.user_metadata?.avatar_url,
        initials: getInitials(name, email),
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!user) return null;

  const avatar = (
    <Avatar className="h-8 w-8 shrink-0">
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />}
      <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs">
        {user.initials}
      </AvatarFallback>
    </Avatar>
  );

  if (collapsed) {
    return (
      <div className="border-sidebar-border border-t p-3">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center">{avatar}</div>
            </TooltipTrigger>
            <TooltipContent side="right">{user.name || user.email}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="border-sidebar-border border-t p-3">
      <div className="flex items-center gap-3 overflow-hidden">
        {avatar}
        <div className={cn("min-w-0 overflow-hidden")}>
          <p className="text-sidebar-foreground truncate text-sm font-medium">
            {user.name || "Utilizator"}
          </p>
          <p className="text-sidebar-foreground/50 truncate text-xs">{user.email}</p>
        </div>
      </div>
    </div>
  );
}
