"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, BellOff, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime";
import { NotificationFilters, getNotificationCategory } from "./NotificationFilters";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/types/notifications";

/**
 * NotificationDrawer
 *
 * Custom Framer Motion drawer replacing shadcn Sheet.
 * Uses theme tokens (--nd-*) for dark gradient surface, spring animation, accent colors.
 * Matches Figma reference design (Revamp Primarie Admin/NotificationCenter).
 */

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationDrawer({ open, onOpenChange }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeType, setActiveType] = useState<string | null>(null);
  const prevCountRef = useRef(0);

  // Real-time subscription (invalidates React Query cache + shows toasts for urgent)
  useNotificationsRealtime();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Fetch notifications when drawer opens
  const fetchNotifications = useCallback(async (): Promise<void> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("utilizator_id", user.id)
      .is("dismissed_at", null)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      // Show toast if new notifications arrived since last fetch
      if (prevCountRef.current > 0 && data.length > prevCountRef.current) {
        const newest = data[0];
        if (newest) {
          toast.info(newest.title, {
            description: newest.message,
            duration: 4000,
          });
        }
      }
      prevCountRef.current = data.length;
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Refetch interval while open for real-time feel
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [open, fetchNotifications]);

  const markAsRead = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient();
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  }, []);

  const dismiss = useCallback(async (id: string): Promise<void> => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ dismissed_at: new Date().toISOString() })
      .eq("id", id);

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllRead = useCallback(async (): Promise<void> => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("utilizator_id", user.id)
      .is("read_at", null);

    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
  }, []);

  // Client-side filtering
  const filtered = notifications.filter((n) => {
    if (showUnreadOnly && n.read_at) return false;
    if (activeType && getNotificationCategory(n.type) !== activeType) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.div
            className="border-nd-border fixed top-0 right-0 z-[95] flex h-screen w-full max-w-md flex-col overflow-hidden border-l bg-[linear-gradient(180deg,var(--nd-bg-from),var(--nd-bg-to))]"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            role="dialog"
            aria-label="Notificari"
          >
            {/* Header */}
            <div className="border-nd-border-section flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-3">
                <Bell className="text-nd-accent h-5 w-5" />
                <h2 className="text-nd-foreground text-base font-bold">Notificari</h2>
                {unreadCount > 0 && (
                  <span className="from-accent-400 to-accent-500 inline-flex items-center justify-center rounded-full bg-gradient-to-br px-2 py-0.5 text-xs font-semibold text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                className="text-nd-muted hover:bg-nd-hover hover:text-nd-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                onClick={() => onOpenChange(false)}
                aria-label="Inchide notificari"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filters + Mark all read */}
            <div className="border-nd-border-section border-b px-5 py-3">
              <div className="flex items-center justify-between">
                <NotificationFilters
                  showUnreadOnly={showUnreadOnly}
                  onToggleUnread={() => setShowUnreadOnly((prev) => !prev)}
                  activeType={activeType}
                  onTypeChange={setActiveType}
                />
                <button
                  className="text-nd-accent shrink-0 text-xs font-medium transition-colors hover:brightness-125"
                  onClick={markAllRead}
                >
                  <span className="flex items-center gap-1">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Marcheaza toate citite
                  </span>
                </button>
              </div>
            </div>

            {/* Notification list */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border-nd-border flex gap-3 rounded-lg border p-3">
                      <Skeleton className="bg-nd-hover h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="bg-nd-hover h-4 w-3/4" />
                        <Skeleton className="bg-nd-border h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BellOff className="text-nd-dimmed mb-3 h-10 w-10" />
                  <p className="text-nd-muted text-sm">Nu ai notificari</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={markAsRead}
                      onDismiss={dismiss}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
