"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import {
  NotificationType,
  NotificationPriority,
  getNotificationTypeLabel,
  getNotificationPriorityLabel,
} from "@/lib/validations/notifications";
import type {
  NotificationTypeEnum,
  NotificationPriorityEnum,
} from "@/lib/validations/notifications";

interface NotificationsFiltersProps {
  filters: {
    type?: NotificationTypeEnum;
    priority?: NotificationPriorityEnum;
    status?: "unread" | "read";
    search?: string;
  };
  onFiltersChange: (filters: Partial<NotificationsFiltersProps["filters"]>) => void;
}

/**
 * NotificationsFilters Component - Desktop Filter Controls
 *
 * REQUIREMENTS:
 * - 4 filter controls (type, priority, status, search)
 * - Select dropdowns for type/priority/status
 * - Search input with debounce (300ms)
 * - "Resetează filtre" button when filters active
 * - Hidden on mobile (mobile uses FilterSheet)
 *
 * LAYOUT:
 * - Horizontal flex row on desktop
 * - gap-4 between controls
 * - Class: hidden md:flex items-center gap-4
 */
export function NotificationsFilters({ filters, onFiltersChange }: NotificationsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search with 300ms delay
  const debouncedSearch = useDebounce(searchValue, 300);

  // Track when debouncing is active
  useEffect(() => {
    if (searchValue !== debouncedSearch) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchValue, debouncedSearch]);

  // Update parent when debounced value changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch || undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]); // Intentionally omit filters.search and onFiltersChange to avoid loops

  // Calculate active filter count
  const activeFilterCount = [filters.type, filters.priority, filters.status, filters.search].filter(
    Boolean
  ).length;

  // Reset all filters
  const handleReset = () => {
    setSearchValue("");
    onFiltersChange({
      type: undefined,
      priority: undefined,
      status: undefined,
      search: undefined,
    });
  };

  // All notification types
  const allTypes: NotificationTypeEnum[] = [
    NotificationType.PAYMENT_DUE,
    NotificationType.CERERE_APPROVED,
    NotificationType.CERERE_REJECTED,
    NotificationType.DOCUMENT_MISSING,
    NotificationType.DOCUMENT_UPLOADED,
    NotificationType.STATUS_UPDATED,
    NotificationType.DEADLINE_APPROACHING,
    NotificationType.ACTION_REQUIRED,
    NotificationType.INFO,
  ];

  // All priorities
  const allPriorities: NotificationPriorityEnum[] = [
    NotificationPriority.URGENT,
    NotificationPriority.HIGH,
    NotificationPriority.MEDIUM,
    NotificationPriority.LOW,
  ];

  return (
    <div className="hidden items-center gap-4 md:flex">
      {/* Type Filter */}
      <Select
        value={filters.type || "toate"}
        onValueChange={(value) =>
          onFiltersChange({ type: value === "toate" ? undefined : (value as NotificationTypeEnum) })
        }
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Toate tipurile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="toate">Toate tipurile</SelectItem>
          {allTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {getNotificationTypeLabel(type)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select
        value={filters.priority || "toate"}
        onValueChange={(value) =>
          onFiltersChange({
            priority: value === "toate" ? undefined : (value as NotificationPriorityEnum),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Toate prioritățile" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="toate">Toate prioritățile</SelectItem>
          {allPriorities.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {getNotificationPriorityLabel(priority)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={filters.status || "toate"}
        onValueChange={(value) =>
          onFiltersChange({ status: value === "toate" ? undefined : (value as "unread" | "read") })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Toate" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="toate">Toate</SelectItem>
          <SelectItem value="unread">Necitite</SelectItem>
          <SelectItem value="read">Citite</SelectItem>
        </SelectContent>
      </Select>

      {/* Search Input */}
      <div className="relative max-w-xs flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Caută în notificări..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pr-9 pl-9"
        />
        {/* Loading indicator when debouncing */}
        {isSearching && (
          <Loader2 className="text-muted-foreground absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin" />
        )}
        {/* Clear button when search has value and not debouncing */}
        {searchValue && !isSearching && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchValue("")}
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0 hover:bg-transparent"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Reset Button - Only show when filters are active */}
      {activeFilterCount > 0 && (
        <Button variant="outline" size="sm" onClick={handleReset} className="shrink-0 gap-2">
          <X className="h-4 w-4" />
          Resetează filtre
        </Button>
      )}
    </div>
  );
}
