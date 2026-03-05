"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * NotificationFilters
 *
 * All/Unread toggle + type filter chips for the notification drawer.
 */

interface NotificationFiltersProps {
  showUnreadOnly: boolean;
  onToggleUnread: () => void;
  activeType: string | null;
  onTypeChange: (type: string | null) => void;
}

const TYPE_CHIPS = [
  { value: null, label: "Toate", dotClass: "" },
  { value: "cereri", label: "Cereri", dotClass: "bg-blue-500" },
  { value: "users", label: "Utilizatori", dotClass: "bg-violet-500" },
  { value: "payments", label: "Plati", dotClass: "bg-green-500" },
  { value: "system", label: "Sistem", dotClass: "bg-amber-500" },
] as const;

/** Map notification types to filter categories */
export function getNotificationCategory(type: string): string {
  if (type.startsWith("cerere_") || type === "status_updated" || type === "deadline_approaching") {
    return "cereri";
  }
  if (type === "action_required") return "users";
  if (type === "payment_due") return "payments";
  return "system";
}

export function NotificationFilters({
  showUnreadOnly,
  onToggleUnread,
  activeType,
  onTypeChange,
}: NotificationFiltersProps) {
  return (
    <div className="space-y-2">
      {/* All / Unread toggle */}
      <div className="flex gap-1">
        <Button
          variant={!showUnreadOnly ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            if (showUnreadOnly) onToggleUnread();
          }}
        >
          Toate
        </Button>
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            if (!showUnreadOnly) onToggleUnread();
          }}
        >
          Necitite
        </Button>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-1">
        {TYPE_CHIPS.map((chip) => (
          <Button
            key={chip.label}
            variant={activeType === chip.value ? "default" : "outline"}
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={() => onTypeChange(chip.value)}
          >
            {chip.dotClass && (
              <span className={cn("inline-block h-2 w-2 rounded-full", chip.dotClass)} />
            )}
            {chip.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
