"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, CheckCheck, BellOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime";
import { NotificationFilters, getNotificationCategory } from "./NotificationFilters";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "@/types/notifications";

/**
 * NotificationDrawer
 *
 * Right-side Sheet with real-time notification list.
 * Supports filtering (all/unread, type), mark-as-read, dismiss, mark-all-read.
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

  // Also set up a refetch interval while open for real-time feel
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full max-w-md flex-col p-0">
        {/* Header */}
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <SheetTitle>Notificari</SheetTitle>
            </div>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={markAllRead}>
              <CheckCheck className="h-3.5 w-3.5" />
              Marcheaza toate citite
            </Button>
          </div>
        </SheetHeader>

        {/* Filters */}
        <div className="border-b px-4 py-2">
          <NotificationFilters
            showUnreadOnly={showUnreadOnly}
            onToggleUnread={() => setShowUnreadOnly((prev) => !prev)}
            activeType={activeType}
            onTypeChange={setActiveType}
          />
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 rounded-lg border p-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="text-muted-foreground mb-3 h-10 w-10" />
              <p className="text-muted-foreground text-sm">Nu ai notificari</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markAsRead}
                  onDismiss={dismiss}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
