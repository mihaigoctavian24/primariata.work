"use client";

import { AnimatePresence, motion } from "motion/react";
import { buildCalendarGrid } from "@/lib/calendar-utils";
import type { CalEvent } from "@/store/calendar-events-store";

// ============================================================================
// Types
// ============================================================================

interface TodayRef {
  year: number;
  month: number;
  day: number;
}

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalEvent[];
  selectedDay: number | null;
  onDayClick: (day: number) => void;
  today: TodayRef;
}

// ============================================================================
// Constants
// ============================================================================

const DAY_ABBREVIATIONS = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"] as const;

// ============================================================================
// Dot color extractor — converts "bg-pink-500 text-white" → "pink-500"
// for use as a dot background via Tailwind's bg-* class
// ============================================================================

function getDotColorClass(colorClasses: string): string {
  const bgClass = colorClasses.split(" ").find((cls) => cls.startsWith("bg-"));
  return bgClass ?? "bg-gray-500";
}

// ============================================================================
// CalendarGrid
// ============================================================================

export function CalendarGrid({
  year,
  month,
  events,
  selectedDay,
  onDayClick,
  today,
}: CalendarGridProps): React.JSX.Element {
  const days = buildCalendarGrid(year, month);
  const isCurrentMonth = today.year === year && today.month === month;

  return (
    <div>
      {/* Day name headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_ABBREVIATIONS.map((abbr) => (
          <div
            key={abbr}
            className="py-2 text-center font-semibold text-gray-600 uppercase"
            style={{ fontSize: "0.72rem" }}
          >
            {abbr}
          </div>
        ))}
      </div>

      {/* Grid with AnimatePresence for month transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.18, ease: "easeInOut" }}
          className="grid grid-cols-7 gap-1"
        >
          {days.map((day, i) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${i}`}
                  className="rounded-xl opacity-30"
                  style={{
                    minHeight: 60,
                    background: "rgba(255,255,255,0.01)",
                  }}
                />
              );
            }

            const dayEvents = events.filter(
              (e) => e.date === day && e.month === month && e.year === year
            );
            const isToday = isCurrentMonth && day === today.day;
            const isSelected = day === selectedDay;
            const displayDots = dayEvents.slice(0, 3);
            const extraCount = dayEvents.length - 3;

            return (
              <motion.button
                key={`day-${day}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDayClick(day)}
                className={[
                  "relative flex cursor-pointer flex-col items-center rounded-xl py-2 transition-colors",
                  isToday ? "ring-accent-500 bg-accent-500/10 ring-2" : "",
                  isSelected && !isToday ? "bg-white/[0.06]" : "",
                  !isToday && !isSelected ? "hover:bg-white/[0.04]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{ minHeight: 60 }}
              >
                {/* Day number */}
                <span
                  className={isToday ? "text-accent-500 font-bold" : "text-gray-300"}
                  style={{ fontSize: "0.88rem" }}
                >
                  {day}
                </span>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="mt-1 flex items-center gap-0.5">
                    {displayDots.map((e) => (
                      <span
                        key={e.id}
                        className={`h-1.5 w-1.5 rounded-full ${getDotColorClass(e.color)}`}
                      />
                    ))}
                    {extraCount > 0 && (
                      <span className="ml-0.5 text-gray-500" style={{ fontSize: "0.6rem" }}>
                        +{extraCount}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
