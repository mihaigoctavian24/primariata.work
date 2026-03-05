"use client";

/**
 * NotificationFilters
 *
 * All/Unread toggle + type filter chips for the notification drawer.
 * Uses --nd-* tokens for dark theme surface, --status-* for category dots,
 * and accent tokens for active state. No hardcoded colors.
 */

interface NotificationFiltersProps {
  showUnreadOnly: boolean;
  onToggleUnread: () => void;
  activeType: string | null;
  onTypeChange: (type: string | null) => void;
}

const TYPE_CHIPS = [
  { value: null, label: "Toate", dotClass: "" },
  { value: "cereri", label: "Cereri", dotClass: "bg-status-info" },
  { value: "users", label: "Utilizatori", dotClass: "bg-status-action" },
  { value: "payments", label: "Plati", dotClass: "bg-status-success" },
  { value: "system", label: "Sistem", dotClass: "bg-status-warning" },
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

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`rounded-md border px-3 py-1 text-[length:var(--font-size-sm)] transition-colors ${
        active
          ? "border-nd-accent/20 bg-nd-accent/15 text-nd-foreground"
          : "text-nd-muted border-transparent bg-transparent"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
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
        <ToggleButton
          active={!showUnreadOnly}
          onClick={() => {
            if (showUnreadOnly) onToggleUnread();
          }}
        >
          Toate
        </ToggleButton>
        <ToggleButton
          active={showUnreadOnly}
          onClick={() => {
            if (!showUnreadOnly) onToggleUnread();
          }}
        >
          Necitite
        </ToggleButton>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-1">
        {TYPE_CHIPS.map((chip) => {
          const isActive = activeType === chip.value;
          return (
            <button
              key={chip.label}
              className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[length:var(--font-size-sm)] transition-colors ${
                isActive
                  ? "border-nd-accent/20 bg-nd-accent/15 text-nd-foreground"
                  : "text-nd-muted border-transparent bg-transparent"
              }`}
              onClick={() => onTypeChange(chip.value)}
            >
              {chip.dotClass && (
                <span className={`inline-block h-2 w-2 rounded-full ${chip.dotClass}`} />
              )}
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
