"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Clock, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import type { CalEvent } from "@/store/calendar-store";

// ============================================================================
// Types
// ============================================================================

interface EventDetailPanelProps {
  selectedDay: number | null;
  year: number;
  month: number;
  events: CalEvent[];
  onEventRemove: (id: string) => void;
  onDaySelect?: (day: number) => void;
}

// ============================================================================
// Constants
// ============================================================================

const ROMANIAN_MONTHS = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
] as const;

// Hex values for colored dots (presentational only, not design tokens)
const DOT_COLOR_MAP: Record<string, string> = {
  "bg-pink-500": "#ec4899",
  "bg-red-500": "#ef4444",
  "bg-amber-500": "#f59e0b",
  "bg-blue-500": "#3b82f6",
  "bg-violet-500": "#8b5cf6",
  "bg-emerald-500": "#10b981",
  "bg-cyan-500": "#06b6d4",
  "bg-orange-500": "#f97316",
  "bg-sky-500": "#0ea5e9",
};

// ============================================================================
// Helpers
// ============================================================================

function buildDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getDotColor(colorClass: string): string {
  const token = colorClass.split(" ").find((c) => c.startsWith("bg-")) ?? colorClass;
  return DOT_COLOR_MAP[token] ?? "#6b7280";
}

function parseDateKey(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split("-").map(Number);
  return { year: parts[0] ?? 0, month: (parts[1] ?? 1) - 1, day: parts[2] ?? 1 };
}

// ============================================================================
// EventDetailPanel
// ============================================================================

export function EventDetailPanel({
  selectedDay,
  year,
  month,
  events,
  onEventRemove,
  onDaySelect,
}: EventDetailPanelProps): React.JSX.Element {
  const monthName = ROMANIAN_MONTHS[month];

  // Events for the selected day
  const dateKey = selectedDay !== null ? buildDateKey(year, month, selectedDay) : null;
  const dayEvents = dateKey ? events.filter((e) => e.date === dateKey) : [];

  // Upcoming events: future events sorted by date, first 5
  const todayKey = buildDateKey(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
  const upcomingEvents = events
    .filter((e) => e.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const handleRemove = (id: string): void => {
    onEventRemove(id);
    toast.success("Eveniment șters");
  };

  const handleUpcomingClick = (dateStr: string): void => {
    const { year: ey, month: em, day: ed } = parseDateKey(dateStr);
    // Only navigate if same month/year displayed
    if (ey === year && em === month && onDaySelect) {
      onDaySelect(ed);
    }
  };

  return (
    <div className="col-span-4 flex flex-col gap-4">
      {/* Card 1: Selected day events */}
      <div
        className="flex flex-col rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            {selectedDay !== null ? (
              <>
                <h3 className="font-semibold text-white" style={{ fontSize: "0.95rem" }}>
                  {selectedDay} {monthName} {year}
                </h3>
                <p className="mt-0.5 text-gray-500" style={{ fontSize: "0.72rem" }}>
                  {dayEvents.length} {dayEvents.length === 1 ? "eveniment" : "evenimente"}
                </p>
              </>
            ) : (
              <h3 className="font-semibold text-gray-500" style={{ fontSize: "0.95rem" }}>
                Selectează o zi
              </h3>
            )}
          </div>
        </div>

        {/* Events list */}
        {selectedDay === null ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-700">
            <CalendarDays className="mb-2 h-9 w-9 opacity-30" />
            <p style={{ fontSize: "0.82rem" }}>Selectează o zi din calendar</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {dayEvents.length > 0 ? (
              <motion.div key="events" className="flex flex-col gap-2.5">
                {dayEvents.map((event, i) => {
                  const dotColor = getDotColor(event.color);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                      exit={{ opacity: 0, y: -8 }}
                      className="group relative rounded-xl p-3"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        borderLeft: `3px solid ${dotColor}`,
                      }}
                    >
                      {/* Event header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: dotColor }}
                          />
                          <span className="font-medium text-white" style={{ fontSize: "0.85rem" }}>
                            {event.title}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemove(event.id)}
                          className="shrink-0 rounded-lg p-1 text-gray-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
                          title="Șterge eveniment"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Event metadata */}
                      <div className="mt-1.5 ml-4 flex flex-col gap-1">
                        {/* Type */}
                        <span
                          className="inline-flex w-fit items-center rounded-md px-2 py-0.5 font-medium text-white"
                          style={{
                            fontSize: "0.65rem",
                            background: dotColor + "33", // 20% opacity
                            color: dotColor,
                          }}
                        >
                          <CalendarDays className="mr-1 h-2.5 w-2.5" />
                          {event.type}
                        </span>

                        {/* Time */}
                        <div
                          className="flex items-center gap-1.5 text-gray-400"
                          style={{ fontSize: "0.73rem" }}
                        >
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>

                        {/* Location */}
                        {event.location && (
                          <div
                            className="flex items-center gap-1.5 text-gray-400"
                            style={{ fontSize: "0.73rem" }}
                          >
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-gray-700"
              >
                <CalendarDays className="mb-2 h-8 w-8 opacity-30" />
                <p style={{ fontSize: "0.82rem" }}>Niciun eveniment</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Card 2: Upcoming events */}
      <div
        className="flex flex-col rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3 className="mb-3 font-semibold text-gray-300" style={{ fontSize: "0.85rem" }}>
          Evenimente Viitoare
        </h3>

        {upcomingEvents.length > 0 ? (
          <div className="flex flex-col gap-2">
            {upcomingEvents.map((event) => {
              const dotColor = getDotColor(event.color);
              const { day: ed, month: em } = parseDateKey(event.date);
              const monthAbbr = (ROMANIAN_MONTHS[em] ?? ROMANIAN_MONTHS[0]).slice(0, 3);
              return (
                <button
                  key={event.id}
                  onClick={() => handleUpcomingClick(event.date)}
                  className="flex items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-white/[0.03]"
                >
                  {/* Colored vertical bar */}
                  <div className="h-8 w-1 shrink-0 rounded-full" style={{ background: dotColor }} />
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate font-medium text-gray-300"
                      style={{ fontSize: "0.78rem" }}
                    >
                      {event.title}
                    </p>
                    <p className="text-gray-600" style={{ fontSize: "0.68rem" }}>
                      {ed} {monthAbbr} · {event.time}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-700">
            <CalendarDays className="mb-1.5 h-7 w-7 opacity-25" />
            <p style={{ fontSize: "0.78rem" }}>Niciun eveniment viitor</p>
          </div>
        )}
      </div>
    </div>
  );
}
