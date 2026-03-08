"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ClickableAvatar } from "@/components/shared/ClickableAvatar";

interface UserInfo {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

interface SidebarUserCardProps {
  collapsed: boolean;
  roleLabel?: string;
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

export function SidebarUserCard({ collapsed, roleLabel }: SidebarUserCardProps) {
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
      rounded="rounded-lg"
      bucketPath="avatars"
      onUploadSuccess={handleAvatarUpload}
    />
  );

  if (collapsed) return null;

  return (
    <div className="border-sidebar-border border-t p-3">
      <div
        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {avatar}
        <div className="min-w-0 flex-1 overflow-hidden">
          <p className="text-sidebar-foreground truncate" style={{ fontSize: "0.8rem" }}>
            {user.name || "Utilizator"}
          </p>
          {roleLabel && (
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5 text-pink-400" />
              <span
                className="truncate text-pink-400/70"
                style={{ fontSize: "0.63rem", fontWeight: 600 }}
              >
                {roleLabel}
              </span>
            </div>
          )}
        </div>
        <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
      </div>
    </div>
  );
}
