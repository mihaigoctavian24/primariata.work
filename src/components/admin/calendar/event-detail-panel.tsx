"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, Clock, MapPin, Trash2 } from "lucide-react";
import type { CalEvent } from "@/store/calendar-events-store";

// ============================================================================
// Types
// ============================================================================

interface EventDetailPanelProps {
  day: number | null;
  year: number;
  month: number;
  events: CalEvent[];
  onAddEvent: () => void;
  onDeleteEvent: (id: string) => void;
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

const ROMANIAN_DAYS = [
  "Duminică",
  "Luni",
  "Marți",
  "Miercuri",
  "Joi",
  "Vineri",
  "Sâmbătă",
] as const;

// ============================================================================
// Dot color extractor
// ============================================================================

function getDotColorClass(colorClasses: string): string {
  const bgClass = colorClasses.split(" ").find((cls) => cls.startsWith("bg-"));
  return bgClass ?? "bg-gray-500";
}

function getBorderColorClass(colorClasses: string): string {
  const bgClass = colorClasses.split(" ").find((cls) => cls.startsWith("bg-"));
  // Convert "bg-pink-500" → "border-pink-500"
  return bgClass ? bgClass.replace("bg-", "border-") : "border-gray-500";
}

// ============================================================================
// EventDetailPanel
// ============================================================================

export function EventDetailPanel({
  day,
  year,
  month,
  events,
  onAddEvent,
  onDeleteEvent,
}: EventDetailPanelProps): React.JSX.Element {
  const dayEvents =
    day !== null
      ? events.filter((e) => e.date === day && e.month === month && e.year === year)
      : [];

  // Compute Romanian day-of-week name
  const dayOfWeekName = day !== null ? ROMANIAN_DAYS[new Date(year, month, day).getDay()] : null;

  const monthName = ROMANIAN_MONTHS[month];

  return (
    <div
      className="flex h-full flex-col rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {day !== null ? (
            <>
              <h3 className="font-semibold text-white" style={{ fontSize: "1rem" }}>
                {dayOfWeekName}, {day} {monthName}
              </h3>
              <p className="text-gray-600" style={{ fontSize: "0.72rem" }}>
                {dayEvents.length} {dayEvents.length === 1 ? "eveniment" : "evenimente"}
              </p>
            </>
          ) : (
            <h3 className="font-semibold text-gray-500" style={{ fontSize: "1rem" }}>
              Selectează o zi
            </h3>
          )}
        </div>

        {day !== null && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onAddEvent}
            className="rounded-xl px-3 py-1.5 text-white transition-all"
            style={{
              background: "var(--accent-gradient)",
              fontSize: "0.75rem",
            }}
          >
            + Adaugă
          </motion.button>
        )}
      </div>

      {/* Events list */}
      {day === null ? (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-700">
          <CalendarDays className="mb-2 h-10 w-10 opacity-30" />
          <p style={{ fontSize: "0.85rem" }}>Selectează o zi din calendar</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {dayEvents.length > 0 ? (
              <motion.div key="events" className="flex flex-col gap-3">
                {dayEvents.map((event, i) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-xl border-l-4 p-3 ${getBorderColorClass(event.color)}`}
                    style={{ background: "rgba(255,255,255,0.025)" }}
                  >
                    {/* Event header */}
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${getDotColorClass(event.color)}`}
                        />
                        <span className="font-medium text-white" style={{ fontSize: "0.88rem" }}>
                          {event.title}
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteEvent(event.id)}
                        className="shrink-0 rounded-lg p-1 text-red-400 transition-colors hover:bg-red-500/10"
                        title="Șterge eveniment"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Event metadata */}
                    <div className="ml-4 flex flex-col gap-1">
                      {/* Type badge */}
                      <span
                        className={`inline-flex w-fit rounded-md px-2 py-0.5 text-[0.68rem] font-medium ${event.color}`}
                      >
                        {event.type}
                      </span>

                      {/* Time */}
                      <div
                        className="flex items-center gap-1.5 text-gray-400"
                        style={{ fontSize: "0.75rem" }}
                      >
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div
                          className="flex items-center gap-1.5 text-gray-400"
                          style={{ fontSize: "0.75rem" }}
                        >
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-gray-700"
              >
                <CalendarDays className="mb-2 h-8 w-8 opacity-30" />
                <p style={{ fontSize: "0.85rem" }}>Niciun eveniment pentru această zi</p>
                <button
                  onClick={onAddEvent}
                  className="mt-3 text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-300"
                  style={{ fontSize: "0.78rem" }}
                >
                  Adaugă primul eveniment
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
