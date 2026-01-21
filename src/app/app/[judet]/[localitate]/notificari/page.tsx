"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import type { NotificationType, NotificationPriority } from "@/types/notifications";
import type { NotificationTypeEnum } from "@/lib/validations/notifications";

/**
 * Notifications List Page
 * Displays all user notifications with advanced filtering, tabs, and real-time updates
 *
 * Features:
 * - Tabs: Toate / Urgente / Arhivă
 * - Advanced Filters: Type, Priority, Status, Search
 * - Debounced search (300ms)
 * - URL state persistence for shareable links
 * - Pagination (10 items per page)
 * - Real-time updates via Supabase Realtime
 * - Actions: Dismiss, Mark as read/unread, Mark all as read
 * - Empty states for different tabs
 * - Loading states with skeletons
 */
export default function NotificariPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  // Debounce search input (300ms)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (activeTab !== "toate") params.set("tab", activeTab);
    if (selectedTypes.length > 0) {
      selectedTypes.forEach((type) => params.append("type", type));
    }
    if (selectedPriority) params.set("priority", selectedPriority);
    if (selectedStatus !== "all") params.set("status", selectedStatus);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (page !== 1) params.set("page", page.toString());

    const paramsString = params.toString();
    const newUrl = `${window.location.pathname}${paramsString ? `?${paramsString}` : ""}`;
    router.replace(newUrl, { scroll: false });
  }, [activeTab, selectedTypes, selectedPriority, selectedStatus, debouncedSearch, page, router]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, selectedTypes, selectedPriority, selectedStatus, debouncedSearch]);

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

  // Enable real-time updates
  useNotificationsRealtime();

  // Actions hook
  const { markAsRead, markAsUnread, dismiss, markAllAsRead } = useNotificationsActions();

  // Tab change handler
  const handleTabChange = (tab: "toate" | "urgente" | "arhiva") => {
    setActiveTab(tab);
    // Auto-adjust status filter based on tab
    if (tab === "arhiva") {
      setSelectedStatus("dismissed");
    } else if (selectedStatus === "dismissed") {
      setSelectedStatus("all");
    }
  };

  // Filter handlers
  const handleResetFilters = () => {
    setSelectedTypes([]);
    setSelectedPriority(undefined);
    setSelectedStatus("all");
    setSearchInput("");
    setPage(1);
  };

  // Action handlers
  const handleDismiss = async (id: string) => {
    dismiss.mutate({ notificationId: id });
  };

  const handleMarkRead = async (id: string) => {
    markAsRead.mutate({ notificationId: id });
  };

  const handleMarkUnread = async (id: string) => {
    markAsUnread.mutate({ notificationId: id });
  };

  const handleMarkAllAsRead = async () => {
    markAllAsRead.mutate({});
  };

  // Tab counts removed - misleading when calculated from filtered data
  const tabCounts = {
    toate: 0,
    urgente: 0,
    arhiva: 0,
  };

  // Empty state messages
  const getEmptyStateMessage = () => {
    if (debouncedSearch) {
      return {
        icon: Bell,
        title: "Nu s-au găsit notificări",
        description: "Încercați să modificați filtrele sau să căutați altceva",
      };
    }

    switch (activeTab) {
      case "urgente":
        return {
          icon: BellOff,
          title: "Nu aveți notificări urgente",
          description: "Notificările urgente vor apărea aici când apar evenimente importante",
        };
      case "arhiva":
        return {
          icon: Archive,
          title: "Nu aveți notificări arhivate",
          description: "Notificările arhivate vor apărea aici",
        };
      default:
        return {
          icon: Bell,
          title: "Nu aveți notificări",
          description: "Notificările vor apărea aici când apar evenimente noi",
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
                <h3 className="text-lg font-semibold">Eroare la încărcarea notificărilor</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {error?.message || "A apărut o eroare la încărcarea notificărilor"}
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
            {!isLoading && notifications.length > 0 && (
              <AnimatePresence key="notifications-list" mode="popLayout">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onDismiss={handleDismiss}
                    onMarkRead={handleMarkRead}
                    onMarkUnread={handleMarkUnread}
                  />
                ))}
              </AnimatePresence>
            )}

            {/* Empty State */}
            {!isLoading && notifications.length === 0 && (
              <div className="border-border/40 bg-muted/30 rounded-lg border p-12 text-center">
                <div className="mx-auto max-w-md space-y-4">
                  <div className="bg-primary/10 mx-auto flex size-16 items-center justify-center rounded-full">
                    <EmptyIcon className="text-primary size-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{emptyState.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{emptyState.description}</p>
                  </div>
                  {debouncedSearch && (
                    <button
                      onClick={handleResetFilters}
                      className="text-primary text-sm hover:underline"
                    >
                      Resetează filtre
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && notifications.length > 0 && (
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
    </div>
  );
}
