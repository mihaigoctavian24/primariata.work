"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  FileText,
  File,
  CreditCard,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TextType from "@/components/TextType";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

/**
 * Dashboard Sidebar Component
 *
 * Features:
 * - Logo with typing animation
 * - Navigation links with icons
 * - Active link highlighting
 * - Collapse/expand functionality
 * - Frosted glass effect
 * - Responsive (mobile overlay)
 */

interface NavigationLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface DashboardSidebarProps {
  open: boolean;
  onToggle: () => void;
  isMobile: boolean;
  judet: string;
  localitate: string;
}

export function DashboardSidebar({
  open,
  onToggle,
  isMobile,
  judet,
  localitate,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const baseHref = `/app/${judet}/${localitate}`;
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user for notifications
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id || null);
    });
  }, []);

  // Fetch unread count with React Query (syncs with mutations)
  const { data: unreadCountData } = useQuery({
    queryKey: ["unread-notifications-count", userId],
    queryFn: async () => {
      if (!userId) return 0;

      const supabase = createClient();
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("utilizator_id", userId)
        .is("read_at", null)
        .is("dismissed_at", null);

      return count || 0;
    },
    enabled: !!userId,
    refetchOnWindowFocus: true,
  });

  const unreadCount = unreadCountData || 0;

  const navigationLinks: NavigationLink[] = [
    { href: `${baseHref}`, label: "Dashboard", icon: Home },
    { href: `${baseHref}/cereri`, label: "Cererile Mele", icon: FileText },
    { href: `${baseHref}/documente`, label: "Documente", icon: File },
    { href: `${baseHref}/plati`, label: "Plăți & Taxe", icon: CreditCard },
    { href: `${baseHref}/notificari`, label: "Notificări", icon: Bell },
    { href: `${baseHref}/setari`, label: "Setări", icon: Settings },
  ];

  const isActiveLink = (href: string) => {
    if (href === baseHref) {
      return pathname === baseHref;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {open && (
          <motion.aside
            initial={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: isMobile ? -280 : 0, opacity: isMobile ? 0 : 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className={cn(
              "flex h-screen flex-col border-r",
              isMobile ? "fixed top-0 left-0 z-50 w-[280px]" : "w-[240px]"
            )}
            style={{
              background:
                "linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
              backdropFilter: "blur(12px) saturate(120%)",
              WebkitBackdropFilter: "blur(12px) saturate(120%)",
              borderRight: "1px solid rgba(255, 255, 255, 0.1)",
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

            {/* Logo Section */}
            <div className="flex h-20 items-center justify-between px-6">
              <Link href={baseHref} className="flex items-center">
                <h1 className="text-xl font-bold md:text-2xl">
                  <span className="inline-block whitespace-nowrap">
                    <TextType
                      text="primariaTa"
                      as="span"
                      className="inline"
                      charStyler={(_char, idx) => {
                        if (idx === 8 || idx === 9) {
                          return { color: "#be3144" };
                        }
                        return {};
                      }}
                      typingSpeed={75}
                      showCursor={false}
                      loop={false}
                    />
                    <motion.span
                      className="inline-block"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{
                        opacity: 1,
                        scale: [1, 1.12, 1, 1.08, 1],
                      }}
                      transition={{
                        opacity: { duration: 0.3, delay: 0.9 },
                        scale: {
                          duration: 2,
                          delay: 1.2,
                          repeat: Infinity,
                          repeatDelay: 3,
                        },
                      }}
                    >
                      <Image
                        src="/vector_heart.svg"
                        alt="❤️"
                        width={20}
                        height={20}
                        className="inline-block"
                        style={{ width: "0.9em", height: "0.9em" }}
                      />
                    </motion.span>
                    <span
                      className="inline"
                      style={{
                        animation: "blink 1.2s ease-in-out 0.9s infinite",
                      }}
                    >
                      _
                    </span>
                  </span>
                </h1>
              </Link>

              {/* Collapse button (desktop only) */}
              {!isMobile && (
                <button
                  onClick={onToggle}
                  className="text-muted-foreground hover:text-foreground rounded-md p-1.5 transition-colors"
                  aria-label="Toggle sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const active = isActiveLink(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    {/* Active indicator */}
                    {active && (
                      <motion.div
                        layoutId="activeLink"
                        className="bg-primary absolute left-0 h-8 w-1 rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    <Icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        active
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    <span className="flex-1">{link.label}</span>

                    {/* Notification badge */}
                    {link.label === "Notificări" && unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-primary text-primary-foreground flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold"
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </motion.span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer - User info section can go here */}
            <div className="border-t border-white/10 p-4">
              <p className="text-muted-foreground text-center text-xs">v1.0.0 - primariaTa</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Collapsed sidebar indicator (desktop only) */}
      {!open && !isMobile && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex h-screen w-16 flex-col items-center border-r py-4"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))",
            backdropFilter: "blur(12px) saturate(120%)",
            WebkitBackdropFilter: "blur(12px) saturate(120%)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <button
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground mb-4 rounded-md p-2 transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Collapsed nav icons */}
          <div className="space-y-2">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              const active = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                  title={link.label}
                >
                  <Icon className="h-5 w-5" />
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </>
  );
}
