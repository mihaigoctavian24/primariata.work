"use client";

import { useEffect, useState } from "react";
import { Bell, Command } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { ClickableAvatar } from "@/components/shared/ClickableAvatar";
import { createClient } from "@/lib/supabase/client";

interface TopBarActionsProps {
  onCommandPalette: () => void;
  onNotifications: () => void;
  unreadCount?: number;
}

interface UserInfo {
  name: string;
  email: string;
  avatarUrl: string | null;
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
  onCommandPalette,
  onNotifications,
  unreadCount = 0,
}: TopBarActionsProps) {
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

  async function handleAvatarUpload(url: string): Promise<void> {
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    setUser((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {/* Command palette trigger — pill with ⌘K */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onCommandPalette}
              aria-label="Cautare (Cmd+K)"
              className="hidden items-center gap-1.5 rounded-xl border border-white/[0.05] bg-white/[0.04] px-3 py-1.5 transition-all hover:bg-white/[0.07] sm:flex"
            >
              <Command className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-[0.78rem] text-gray-500">Caută rapid...</span>
              <kbd className="ml-1 text-[0.78rem] text-gray-500">⌘K</kbd>
            </button>
          </TooltipTrigger>
          <TooltipContent>Cautare (Cmd+K)</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Theme toggle — glass pill wrapper */}
      <ThemeToggle
        compact
        className="rounded-xl border border-white/[0.05] bg-white/[0.04] text-gray-400 hover:bg-white/[0.07] hover:text-white"
      />

      {/* Notification bell — glass pill + gradient badge */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onNotifications}
              aria-label="Notificari"
              className="relative flex items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.04] p-2 text-gray-400 transition-all hover:bg-white/[0.07] hover:text-white"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[0.6rem] font-medium text-white"
                  style={{ background: "linear-gradient(135deg, #ec4899, #f43f5e)" }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>Notificari</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* User avatar — with emerald online dot */}
      {user && (
        <div className="relative">
          <ClickableAvatar
            currentUrl={user.avatarUrl}
            initials={user.initials}
            size="sm"
            bucketPath="avatars"
            onUploadSuccess={handleAvatarUpload}
          />
          <span className="absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-[#09090f] bg-emerald-400" />
        </div>
      )}
    </div>
  );
}
