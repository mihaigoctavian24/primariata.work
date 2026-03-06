"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ClickableAvatar } from "@/components/shared/ClickableAvatar";

interface UserInfo {
  name: string;
  email: string;
  avatarUrl: string | null;
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
  const router = useRouter();

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
        avatarUrl: authUser.user_metadata?.avatar_url ?? null,
        initials: getInitials(name, email),
      });
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!user) return null;

  async function handleAvatarUpload(url: string): Promise<void> {
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
    router.refresh();
  }

  const avatar = (
    <ClickableAvatar
      currentUrl={user.avatarUrl}
      initials={user.initials}
      size="sm"
      bucketPath="avatars"
      onUploadSuccess={handleAvatarUpload}
    />
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
