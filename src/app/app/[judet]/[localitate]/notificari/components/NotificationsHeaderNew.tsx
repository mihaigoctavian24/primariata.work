"use client";

import { CheckCheck, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NotificationType, NotificationPriority } from "@/types/notifications";

interface NotificationsHeaderNewProps {
  unreadCount: number;
  onMarkAllAsRead: () => void;
  // Filter state
  searchInput: string;
  onSearchChange: (value: string) => void;
  selectedTypes: NotificationType[];
  onTypesChange: (types: NotificationType[]) => void;
  selectedPriority: NotificationPriority | undefined;
  onPriorityChange: (priority: NotificationPriority | undefined) => void;
  selectedStatus: "all" | "unread" | "read" | "dismissed";
  onStatusChange: (status: "all" | "unread" | "read" | "dismissed") => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

export function NotificationsHeaderNew({
  unreadCount,
  onMarkAllAsRead,
  searchInput,
  onSearchChange,
  selectedTypes,
  onTypesChange,
  selectedPriority,
  onPriorityChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  isLoading = false,
}: NotificationsHeaderNewProps) {
  const hasActiveFilters =
    selectedTypes.length > 0 || selectedPriority || selectedStatus !== "all" || searchInput;

  return (
    <div className="via-background/50 to-background bg-gradient-to-b from-transparent px-4 py-6 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Title, Badge, and Actions */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Notificări</h1>
            {unreadCount > 0 && (
              <Badge variant="default" className="h-6 px-2 text-xs">
                {unreadCount} necitite
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            disabled={unreadCount === 0}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Marchează toate ca citite</span>
            <span className="sm:hidden">Marchează toate</span>
          </Button>
        </div>

        {/* Inline Filters - Compact Layout */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Search - Matching Dashboard GlobalSearchBar style */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Caută notificări..."
              className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary h-11 w-full rounded-lg border pr-10 pl-10 text-sm focus:ring-1 focus:outline-none"
            />
            {isLoading && (
              <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
            )}
          </div>

          {/* Type Filter */}
          <Select
            value={selectedTypes[0] || "all"}
            onValueChange={(value) =>
              onTypesChange(value === "all" ? [] : [value as NotificationType])
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate tipurile</SelectItem>
              <SelectItem value="cerere_status">Cerere Status</SelectItem>
              <SelectItem value="plata_status">Plată Status</SelectItem>
              <SelectItem value="document_ready">Document Ready</SelectItem>
              <SelectItem value="mesaj_primit">Mesaj Primit</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={selectedPriority || "all"}
            onValueChange={(value) =>
              onPriorityChange(value === "all" ? undefined : (value as NotificationPriority))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Prioritate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate prioritățile</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">Înaltă</SelectItem>
              <SelectItem value="medium">Medie</SelectItem>
              <SelectItem value="low">Scăzută</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onValueChange={(value) => onStatusChange(value as typeof selectedStatus)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toate statusurile</SelectItem>
              <SelectItem value="unread">Necitite</SelectItem>
              <SelectItem value="read">Citite</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onResetFilters} className="gap-2">
              <X className="h-4 w-4" />
              Resetează
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
