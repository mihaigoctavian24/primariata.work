"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X, Search } from "lucide-react";
import type { NotificationType, NotificationPriority } from "@/types/notifications";

interface NotificationsFilterSheetProps {
  filters: {
    type?: NotificationType;
    priority?: NotificationPriority;
    status?: "unread" | "read";
    search?: string;
  };
  onFiltersChange: (filters: Partial<NotificationsFilterSheetProps["filters"]>) => void;
}

const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  payment_due: "Plată Scadentă",
  cerere_approved: "Cerere Aprobată",
  cerere_rejected: "Cerere Respinsă",
  document_missing: "Document Lipsă",
  document_uploaded: "Document Încărcat",
  status_updated: "Status Actualizat",
  deadline_approaching: "Termen Apropiat",
  action_required: "Acțiune Necesară",
  info: "Informare",
};

const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  urgent: "Urgent",
  high: "Prioritate Înaltă",
  medium: "Prioritate Medie",
  low: "Prioritate Scăzută",
};

export function NotificationsFilterSheet({
  filters,
  onFiltersChange,
}: NotificationsFilterSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  // Count active filters (excluding search as it's always visible)
  const activeFilterCount = [localFilters.type, localFilters.priority, localFilters.status].filter(
    Boolean
  ).length;

  const handleReset = () => {
    const resetFilters = {
      type: undefined,
      priority: undefined,
      status: undefined,
      search: "",
    };
    setLocalFilters(resetFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="relative gap-2 md:hidden"
          onClick={() => setIsOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtre
          {activeFilterCount > 0 && (
            <Badge
              variant="default"
              className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
            >
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="flex h-[80vh] flex-col backdrop-blur-sm">
        <SheetHeader>
          <SheetTitle>Filtre Notificări</SheetTitle>
        </SheetHeader>

        {/* Scrollable content area */}
        <div className="flex-1 space-y-6 overflow-y-auto py-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Caută</Label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="search"
                type="text"
                placeholder="Caută în notificări..."
                value={localFilters.search || ""}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type-filter">Tip Notificare</Label>
            <Select
              value={localFilters.type || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  type: value === "all" ? undefined : (value as NotificationType),
                })
              }
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Toate tipurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate tipurile</SelectItem>
                {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label htmlFor="priority-filter">Prioritate</Label>
            <Select
              value={localFilters.priority || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  priority: value === "all" ? undefined : (value as NotificationPriority),
                })
              }
            >
              <SelectTrigger id="priority-filter">
                <SelectValue placeholder="Toate prioritățile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate prioritățile</SelectItem>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={localFilters.status || "all"}
              onValueChange={(value) =>
                setLocalFilters({
                  ...localFilters,
                  status: value === "all" ? undefined : (value as "unread" | "read"),
                })
              }
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Toate statusurile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate statusurile</SelectItem>
                <SelectItem value="unread">Necitite</SelectItem>
                <SelectItem value="read">Citite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer with action buttons */}
        <SheetFooter className="flex-row gap-2 border-t pt-4">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleReset}>
            <X className="h-4 w-4" />
            Resetează
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Aplică Filtre
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
