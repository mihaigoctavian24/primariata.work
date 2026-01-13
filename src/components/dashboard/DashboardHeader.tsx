"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, MapPin, Bell, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Dashboard Header Component
 *
 * Features:
 * - Location display (clickable to change)
 * - Notification bell with badge
 * - User menu dropdown (Profile, Settings, Logout)
 * - Hamburger menu (mobile)
 * - Frosted glass effect
 */

interface DashboardHeaderProps {
  onMenuClick: () => void;
  isMobile: boolean;
  judet: string;
  localitate: string;
}

interface UserData {
  email: string;
  full_name?: string;
  avatar_url?: string;
}

export function DashboardHeader({
  onMenuClick,
  isMobile,
  judet,
  localitate,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [locationName, setLocationName] = useState<string>("");

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      console.log("🔄 Header: Fetching user data...");
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        console.log("👤 Header: User data:", {
          full_name: authUser.user_metadata?.full_name,
          avatar_url: authUser.user_metadata?.avatar_url,
        });
        setUser({
          email: authUser.email || "",
          full_name: authUser.user_metadata?.full_name,
          avatar_url: authUser.user_metadata?.avatar_url,
        });
        console.log(
          "✅ Header: State updated with avatar_url:",
          authUser.user_metadata?.avatar_url
        );
      } else {
        console.log("❌ Header: No user found");
      }
    }

    fetchUser();
  }, []);

  // Fetch location name
  // TODO: Create API endpoint /api/localitati/[slug]/route.ts to fetch localitate by slug
  // Currently using fallback (slug transformation) until endpoint is implemented
  useEffect(() => {
    async function fetchLocationName() {
      try {
        const response = await fetch(`/api/localitati/${localitate}`);

        // Check if response is OK before parsing JSON
        if (!response.ok) {
          // API endpoint doesn't exist yet - use fallback
          setLocationName(`${localitate.replace(/-/g, " ")}, Jud. ${judet.replace(/-/g, " ")}`);
          return;
        }

        const data = await response.json();
        if (data.data) {
          setLocationName(`${data.data.nume}, Jud. ${judet}`);
        }
      } catch (error) {
        console.error("Failed to fetch location name:", error);
        setLocationName(`${localitate.replace(/-/g, " ")}, Jud. ${judet.replace(/-/g, " ")}`);
      }
    }

    fetchLocationName();
  }, [judet, localitate]);

  // Fetch unread notifications count
  useEffect(() => {
    async function fetchNotifications() {
      const supabase = createClient();
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .is("read_at", null)
        .is("dismissed_at", null);

      setUnreadNotifications(count || 0);
    }

    fetchNotifications();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleChangeLocation = () => {
    router.push("/?step=2");
  };

  return (
    <header
      className="z-30 border-b"
      style={{
        background:
          "linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
        backdropFilter: "blur(12px) saturate(120%)",
        WebkitBackdropFilter: "blur(12px) saturate(120%)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Subtle shine effect at top */}
      <div
        className="pointer-events-none absolute top-0 right-0 left-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3) 50%, transparent)",
        }}
      />

      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Menu + Location */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu (mobile/tablet) */}
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="text-muted-foreground hover:text-foreground rounded-md p-2 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Location display */}
          <button
            onClick={handleChangeLocation}
            className="text-muted-foreground hover:text-foreground group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200"
            aria-label={`Schimbă locația curentă: ${locationName || "Loading..."}`}
          >
            <MapPin className="text-primary h-4 w-4" />
            <span className="hidden sm:inline">{locationName || "Loading..."}</span>
            <ChevronDown className="h-3 w-3 opacity-50 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>

        {/* Right: Notifications + User Menu */}
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <Link
            href={`/app/${judet}/${localitate}/notificari`}
            className="text-muted-foreground hover:text-foreground relative rounded-md p-2 transition-colors"
            aria-label={
              unreadNotifications > 0 ? `Notificări: ${unreadNotifications} necitite` : "Notificări"
            }
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadNotifications > 0 && (
              <Badge
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                style={{
                  backgroundColor: "#be3144",
                  color: "white",
                }}
                aria-hidden="true"
              >
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Link>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none" aria-label="Meniu utilizator">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar className="h-9 w-9 cursor-pointer">
                  {user?.avatar_url && (
                    <AvatarImage src={user.avatar_url} alt={user.full_name || "User"} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))",
                backdropFilter: "blur(12px) saturate(120%)",
                WebkitBackdropFilter: "blur(12px) saturate(120%)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{user?.full_name || "User"}</span>
                  <span className="text-muted-foreground text-xs">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={`/app/${judet}/${localitate}/profil`}
                  className="flex cursor-pointer items-center"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profilul Meu
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/app/${judet}/${localitate}/setari`}
                  className="flex cursor-pointer items-center"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Setări
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Deconectare
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
