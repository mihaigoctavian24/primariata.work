"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Bell, BellOff, Archive } from "lucide-react";
import { NotificationsHeaderNew } from "./components/NotificationsHeaderNew";
import { NotificationsTabs } from "./components/NotificationsTabs";
import {
  NotificationCard,
  NotificationCardSkeleton,
} from "@/components/notificari/NotificationCard";
import { NotificationsPagination } from "./components/NotificationsPagination";
import { useNotificationsList } from "@/hooks/use-notifications-list";
import { useNotificationsActions } from "@/hooks/use-notifications-actions";
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime";
import { useDebounce } from "@/hooks/use-debounce";
import { useUserPrimarii, getPrimarieInfo } from "@/hooks/use-user-primarii";
import { parseActionUrl } from "@/hooks/use-primarie-switch";
import { ContextSwitchDialog } from "@/components/notifications/ContextSwitchDialog";
import type { NotificationType, NotificationPriority } from "@/types/notifications";
import type { NotificationTypeEnum } from "@/lib/validations/notifications";
import type { UserPrimarieInfo } from "@/hooks/use-user-primarii";

/**
 * Notifications List Page
 * Displays all user notifications with advanced filtering, tabs, and real-time updates
 *
 * Features:
 * - Tabs: Toate / Urgente / Arhiva
 * - Advanced Filters: Type, Priority, Status, Search, Primarie
 * - Debounced search (300ms)
 * - URL state persistence for shareable links
 * - Pagination (10 items per page)
 * - Real-time updates via Supabase Realtime
 * - Actions: Dismiss, Mark as read/unread, Mark all as read
 * - Cross-primarie: badges, primarie filter, ContextSwitchDialog
 * - Empty states for different tabs
 * - Loading states with skeletons
 */
/**
 * Suspense-wrapped page export to prevent hydration mismatch from useSearchParams()
 * Next.js 15 requires useSearchParams() to be inside a Suspense boundary
 */
export default function NotificariPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <div className="flex-1 p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <NotificationCardSkeleton key={index} />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <NotificariContent />
    </Suspense>
  );
}

function NotificariContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  // Extract current judet/localitate from URL params
  const judet = params.judet as string;
  const localitate = params.localitate as string;

  // Cross-primarie hooks
  const { primarii } = useUserPrimarii();
  const currentPrimarie = primarii.find(
    (p) => p.judetSlug === judet && p.localitateSlug === localitate
  );
  const currentPrimarieId = currentPrimarie?.primarieId;
  const currentPrimarieName = currentPrimarie?.numeOficial;

  // Context switch dialog state
  const [contextSwitchTarget, setContextSwitchTarget] = useState<{
    targetPrimarie: UserPrimarieInfo;
    actionUrl: string;
    destinationLabel: string;
  } | null>(null);

  // Initialize state from URL
  const [activeTab, setActiveTab] = useState<"toate" | "urgente" | "arhiva">(
    (searchParams.get("tab") as "toate" | "urgente" | "arhiva") || "toate"
  );
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<"all" | "unread" | "read" | "dismissed">(
    (searchParams.get("status") as "all" | "unread" | "read" | "dismissed") || "all"
  );
  const [searchInput, setSearchInput] = useState<string>(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));

  // Primarie filter state (client-side only, defaults to all)
  const [selectedPrimarie, setSelectedPrimarie] = useState<string | undefined>(undefined);

  // Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL when filters change
  useEffect(() => {
    const urlParams = new URLSearchParams();

    if (activeTab !== "toate") urlParams.set("tab", activeTab);
    if (selectedTypes.length > 0) {
      selectedTypes.forEach((type) => urlParams.append("type", type));
    }
    if (selectedPriority) urlParams.set("priority", selectedPriority);
    if (selectedStatus !== "all") urlParams.set("status", selectedStatus);
    if (debouncedSearch) urlParams.set("search", debouncedSearch);
    if (page !== 1) urlParams.set("page", page.toString());

    const paramsString = urlParams.toString();
    const newUrl = `${window.location.pathname}${paramsString ? `?${paramsString}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [activeTab, selectedTypes, selectedPriority, selectedStatus, debouncedSearch, page, router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [
    activeTab,
    selectedTypes,
    selectedPriority,
    selectedStatus,
    debouncedSearch,
    selectedPrimarie,
  ]);

  // Fetch notifications using custom hook
  const { notifications, pagination, unreadCount, isLoading, isError, error } =
    useNotificationsList({
      page,
      limit: 10,
      type: selectedTypes.length > 0 ? (selectedTypes[0] as NotificationTypeEnum) : undefined,
      priority: selectedPriority,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      search: debouncedSearch,
      tab: activeTab,
      sort: "created_at",
      order: "desc",
    });

  // Apply client-side primarie filter
  const filteredNotifications = selectedPrimarie
    ? notifications.filter((n) => n.primarie_id === selectedPrimarie)
    : notifications;

  // Enable real-time updates
  useNotificationsRealtime();

  // Actions hook
  const { markAsRead, markAsUnread, dismiss, markAllAsRead } = useNotificationsActions();

  // Tab change handler
  const handleTabChange = (tab: "toate" | "urgente" | "arhiva"): void => {
    setActiveTab(tab);
    // Auto-adjust status filter based on tab
    if (tab === "arhiva") {
      setSelectedStatus("dismissed");
    } else if (selectedStatus === "dismissed") {
      setSelectedStatus("all");
    }
  };

  // Filter handlers
  const handleResetFilters = (): void => {
    setSelectedTypes([]);
    setSelectedPriority(undefined);
    setSelectedStatus("all");
    setSearchInput("");
    setSelectedPrimarie(undefined);
    setPage(1);
  };

  // Action handlers
  const handleDismiss = async (id: string): Promise<void> => {
    dismiss.mutate({ notificationId: id });
  };

  const handleMarkRead = async (id: string): Promise<void> => {
    markAsRead.mutate({ notificationId: id });
  };

  const handleMarkUnread = async (id: string): Promise<void> => {
    markAsUnread.mutate({ notificationId: id });
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    markAllAsRead.mutate({});
  };

  /**
   * Handle notification action click for cross-primarie context switching.
   * Same-primarie: navigate directly via router.push.
   * Different primarie: open ContextSwitchDialog for confirmation.
   */
  const handleActionClick = (
    actionUrl: string,
    notification: { primarie_id: string; title: string }
  ): void => {
    const targetPrimarie = getPrimarieInfo(primarii, notification.primarie_id);

    if (!targetPrimarie || targetPrimarie.primarieId === currentPrimarieId) {
      // Same primarie or unknown -- navigate directly
      const relativePath = parseActionUrl(actionUrl);
      router.push(`/app/${judet}/${localitate}${relativePath}`);
    } else {
      // Different primarie -- show confirmation dialog
      setContextSwitchTarget({
        targetPrimarie,
        actionUrl,
        destinationLabel: notification.title,
      });
    }
  };

  // Tab counts removed - misleading when calculated from filtered data
  const tabCounts = {
    toate: 0,
    urgente: 0,
    arhiva: 0,
  };

  // Empty state messages
  const getEmptyStateMessage = (): { icon: typeof Bell; title: string; description: string } => {
    if (debouncedSearch) {
      return {
        icon: Bell,
        title: "Nu s-au gasit notificari",
        description: "Incercati sa modificati filtrele sau sa cautati altceva",
      };
    }

    switch (activeTab) {
      case "urgente":
        return {
          icon: BellOff,
          title: "Nu aveti notificari urgente",
          description: "Notificarile urgente vor aparea aici cand apar evenimente importante",
        };
      case "arhiva":
        return {
          icon: Archive,
          title: "Nu aveti notificari arhivate",
          description: "Notificarile arhivate vor aparea aici",
        };
      default:
        return {
          icon: Bell,
          title: "Nu aveti notificari",
          description: "Notificarile vor aparea aici cand apar evenimente noi",
        };
    }
  };

  const emptyState = getEmptyStateMessage();
  const EmptyIcon = emptyState.icon;

  // Error state
  if (isError) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 p-6">
          <div className="border-border/40 bg-muted/30 rounded-lg border p-12 text-center">
            <div className="mx-auto max-w-md space-y-4">
              <div className="bg-destructive/10 mx-auto flex size-16 items-center justify-center rounded-full">
                <BellOff className="text-destructive size-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Eroare la incarcarea notificarilor</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {error?.message || "A aparut o eroare la incarcarea notificarilor"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with Filters */}
      <NotificationsHeaderNew
        unreadCount={unreadCount}
        onMarkAllAsRead={handleMarkAllAsRead}
        searchInput={searchInput}
        onSearchChange={setSearchInput}
        selectedTypes={selectedTypes}
        onTypesChange={setSelectedTypes}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        selectedPrimarie={selectedPrimarie}
        onPrimarieChange={setSelectedPrimarie}
        userPrimarii={primarii.map((p) => ({
          primarieId: p.primarieId,
          numeOficial: p.numeOficial,
        }))}
      />

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Tabs - Centered like Settings Page */}
          <div className="mx-auto mb-6 max-w-2xl">
            <NotificationsTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              counts={tabCounts}
            />
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <NotificationCardSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Notifications List with Animation */}
            {!isLoading && filteredNotifications.length > 0 && (
              <AnimatePresence key="notifications-list" mode="popLayout">
                {filteredNotifications.map((notification) => {
                  const notifPrimarie = getPrimarieInfo(primarii, notification.primarie_id);
                  return (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onDismiss={handleDismiss}
                      onMarkRead={handleMarkRead}
                      onMarkUnread={handleMarkUnread}
                      onActionClick={(url) =>
                        handleActionClick(url, {
                          primarie_id: notification.primarie_id,
                          title: notification.title,
                        })
                      }
                      currentPrimarieId={currentPrimarieId}
                      primarieName={notifPrimarie?.numeOficial}
                    />
                  );
                })}
              </AnimatePresence>
            )}

            {/* Empty State */}
            {!isLoading && filteredNotifications.length === 0 && (
              <div className="border-border/40 bg-muted/30 rounded-lg border p-12 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  <div className="bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-full">
                    <EmptyIcon className="text-primary size-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{emptyState.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{emptyState.description}</p>
                  </div>
                  {(debouncedSearch || selectedPrimarie) && (
                    <button
                      onClick={handleResetFilters}
                      className="text-primary text-sm hover:underline"
                    >
                      Reseteaza filtre
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && filteredNotifications.length > 0 && (
              <NotificationsPagination
                pagination={{
                  page: page,
                  limit: 10,
                  total: pagination.total,
                  total_pages: pagination.total_pages,
                }}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>
      </div>

      {/* Context Switch Dialog */}
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
    </div>
  );
}
