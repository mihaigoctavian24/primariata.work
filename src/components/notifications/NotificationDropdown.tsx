"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useNotificationsList } from "@/hooks/use-notifications-list";
import { useNotificationsActions } from "@/hooks/use-notifications-actions";
import { createClient } from "@/lib/supabase/client";
import { useUserPrimarii, getPrimarieInfo } from "@/hooks/use-user-primarii";
import { parseActionUrl } from "@/hooks/use-primarie-switch";
import { ContextSwitchDialog } from "@/components/notifications/ContextSwitchDialog";
import { NotificationDropdownItem } from "./NotificationDropdownItem";
import type { Notification } from "@/types/notifications";
import type { UserPrimarieInfo } from "@/hooks/use-user-primarii";

interface NotificationDropdownProps {
  judet: string;
  localitate: string;
}

/**
 * Notification dropdown for dashboard header
 *
 * Features:
 * - Desktop: Popover (w-96, max-h-[400px])
 * - Mobile: Sheet (bottom drawer, 80vh)
 * - Badge with unread count (9+ if > 9)
 * - Real-time updates via React Query
 * - Optimistic updates for mark read/dismiss
 * - Cross-primarie badges and context switch dialog
 * - Loading skeleton
 * - Empty state
 * - Footer link to full notifications page
 */
export function NotificationDropdown({ judet, localitate }: NotificationDropdownProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Cross-primarie state
  const { primarii } = useUserPrimarii();
  const [contextSwitchTarget, setContextSwitchTarget] = useState<{
    targetPrimarie: UserPrimarieInfo;
    actionUrl: string;
    destinationLabel: string;
  } | null>(null);

  // Determine current primarie from URL params
  const currentPrimarie = primarii.find(
    (p) => p.judetSlug === judet && p.localitateSlug === localitate
  );
  const currentPrimarieId = currentPrimarie?.primarieId;
  const currentPrimarieName = currentPrimarie?.numeOficial;

  // Fetch notifications (last 10)
  const { notifications, isLoading, isError, refetch } = useNotificationsList({
    page: 1,
    limit: 10,
  });

  // Get mutation actions
  const { markAsRead, dismiss } = useNotificationsActions();

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

  // Get user ID and detect mobile viewport
  useEffect(() => {
    const supabase = createClient();

    const fetchUser = async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };

    fetchUser();

    // Detect mobile viewport
    const checkMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Subscribe to real-time changes for notifications list
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    const channel = supabase
      .channel("notification-dropdown-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `utilizator_id=eq.${userId}`,
        },
        () => {
          // Refetch notifications list (unread count handled by useUnreadNotifications hook)
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refetch]);

  const handleMarkRead = (notificationId: string): void => {
    markAsRead.mutate({ notificationId });
  };

  const handleDismiss = (notificationId: string): void => {
    dismiss.mutate({ notificationId });
  };

  const handleViewAll = (): void => {
    router.push(`/app/${judet}/${localitate}/notificari`);
  };

  /**
   * Handle notification click for cross-primarie context switching.
   * Same-primarie: navigate directly via router.push.
   * Different primarie: open ContextSwitchDialog for confirmation.
   */
  const handleNotificationClick = (notification: Notification): void => {
    if (!notification.action_url) return;

    const targetPrimarie = getPrimarieInfo(primarii, notification.primarie_id);

    if (!targetPrimarie || targetPrimarie.primarieId === currentPrimarieId) {
      // Same primarie or unknown primarie -- navigate directly
      const relativePath = parseActionUrl(notification.action_url);
      router.push(`/app/${judet}/${localitate}${relativePath}`);
    } else {
      // Different primarie -- show confirmation dialog
      setContextSwitchTarget({
        targetPrimarie,
        actionUrl: notification.action_url,
        destinationLabel: notification.title,
      });
    }
  };

  // Filter out dismissed notifications
  const activeNotifications = notifications.filter((n) => !n.dismissed_at);

  // Loading skeleton
  const LoadingSkeleton = (): React.JSX.Element => (
    <div className="space-y-3 p-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="bg-muted h-10 w-10 flex-shrink-0 animate-pulse rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-3 w-full animate-pulse rounded" />
            <div className="bg-muted h-3 w-1/2 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = (): React.JSX.Element => (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <Bell className="text-muted-foreground mb-3 h-12 w-12" />
      <p className="text-muted-foreground text-sm">Nu aveti notificari</p>
    </div>
  );

  // Error state
  const ErrorState = (): React.JSX.Element => (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <p className="text-destructive mb-3 text-sm">Eroare la incarcarea notificarilor</p>
      <Button variant="outline" size="sm" onClick={() => refetch()}>
        Reincarca
      </Button>
    </div>
  );

  // Content
  const DropdownContent = (): React.JSX.Element => (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="p-4">
        <h3 className="text-base font-semibold">Notificari</h3>
        {unreadCount > 0 && (
          <p className="text-muted-foreground text-sm">
            {unreadCount} {unreadCount === 1 ? "notificare necitita" : "notificari necitite"}
          </p>
        )}
      </div>

      {/* List */}
      <ScrollArea className="max-h-[200px] overflow-y-auto">
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <ErrorState />
        ) : activeNotifications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2 p-3">
            {activeNotifications.map((notification) => {
              const notifPrimarie = getPrimarieInfo(primarii, notification.primarie_id);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={notification.action_url ? "cursor-pointer" : undefined}
                  role={notification.action_url ? "button" : undefined}
                  tabIndex={notification.action_url ? 0 : undefined}
                  onKeyDown={
                    notification.action_url
                      ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleNotificationClick(notification);
                          }
                        }
                      : undefined
                  }
                >
                  <NotificationDropdownItem
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDismiss={handleDismiss}
                    currentPrimarieId={currentPrimarieId}
                    primarieName={notifPrimarie?.numeOficial}
                  />
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {activeNotifications.length > 0 && (
        <div className="flex justify-center p-3">
          <Button variant="ghost" size="sm" onClick={handleViewAll} className="group text-sm">
            Vezi toate notificarile
            <span className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Button>
        </div>
      )}
    </div>
  );

  // Badge display
  const badgeCount = unreadCount > 9 ? "9+" : unreadCount.toString();

  // Mobile: Sheet
  if (isMobile) {
    return (
      <>
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="hover:bg-accent/50 relative rounded-md p-2 transition-colors"
              aria-label="Notificari"
            >
              <Bell className="text-foreground h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="bg-accent-500 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold text-white">
                  {badgeCount}
                </Badge>
              )}
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="border-border/50 h-[80vh] rounded-t-3xl border-t p-0"
          >
            <DropdownContent />
          </SheetContent>
        </Sheet>
        {contextSwitchTarget && (
          <ContextSwitchDialog
            open={!!contextSwitchTarget}
            onOpenChange={(open) => !open && setContextSwitchTarget(null)}
            currentPrimarie={currentPrimarieName || ""}
            targetPrimarie={contextSwitchTarget.targetPrimarie}
            destinationLabel={contextSwitchTarget.destinationLabel}
            actionUrl={contextSwitchTarget.actionUrl}
          />
        )}
      </>
    );
  }

  // Desktop: Popover
  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="hover:bg-accent/50 relative rounded-md p-2 transition-colors"
            aria-label="Notificari"
          >
            <Bell className="text-foreground h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="bg-accent-500 absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px] font-bold text-white">
                {badgeCount}
              </Badge>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="border-border/50 w-96 rounded-2xl p-0 shadow-xl" align="end">
          <div className="max-h-[400px]">
            <DropdownContent />
          </div>
        </PopoverContent>
      </Popover>
      {contextSwitchTarget && (
        <ContextSwitchDialog
          open={!!contextSwitchTarget}
          onOpenChange={(open) => !open && setContextSwitchTarget(null)}
          currentPrimarie={currentPrimarieName || ""}
          targetPrimarie={contextSwitchTarget.targetPrimarie}
          destinationLabel={contextSwitchTarget.destinationLabel}
          actionUrl={contextSwitchTarget.actionUrl}
        />
      )}
    </>
  );
}
