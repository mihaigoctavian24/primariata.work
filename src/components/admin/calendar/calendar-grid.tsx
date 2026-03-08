"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalEvent } from "@/store/calendar-store";

// ============================================================================
// Types
// ============================================================================

interface CalendarGridProps {
  year: number;
  month: number;
  events: CalEvent[];
  selectedDay: number | null;
  onDaySelect: (day: number) => void;
  onMonthChange: (dir: "prev" | "next") => void;
  onTodayClick: () => void;
}

// ============================================================================
// Constants
// ============================================================================

const DAY_ABBREVIATIONS = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"] as const;

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

// ============================================================================
// Calendar math — Monday-start grid
// ============================================================================

function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday-start: (0→6, 1→0, 2→1, ..., 6→5)
  const offset = (firstDayOfMonth + 6) % 7;
  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

// ============================================================================
// Helpers
// ============================================================================

function getDotColorClass(colorClass: string): string {
  // color is "bg-pink-500" — already a valid Tailwind bg class
  if (colorClass.startsWith("bg-")) return colorClass;
  // Extract first bg-* token if compound class string
  const bgToken = colorClass.split(" ").find((cls) => cls.startsWith("bg-"));
  return bgToken ?? "bg-gray-500";
}

function getEventDateKey(e: CalEvent): string {
  return e.date; // "YYYY-MM-DD"
}

function buildDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ============================================================================
// CalendarGrid
// ============================================================================

export function CalendarGrid({
  year,
  month,
  events,
  selectedDay,
  onDaySelect,
  onMonthChange,
  onTodayClick,
}: CalendarGridProps): React.JSX.Element {
  const now = new Date();
  const today = { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  const isCurrentMonth = today.year === year && today.month === month;

  const days = buildCalendarGrid(year, month);
  const monthName = ROMANIAN_MONTHS[month];

  return (
    <div
      className="col-span-8 rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Month navigation */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-bold text-white" style={{ fontSize: "1.2rem" }}>
          {monthName} {year}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMonthChange("prev")}
            className="rounded-xl p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
            aria-label="Luna precedentă"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onTodayClick}
            className="text-accent-500 hover:bg-accent-500/10 rounded-xl px-3 py-1.5 text-xs transition-all"
          >
            Azi
          </button>
          <button
            onClick={() => onMonthChange("next")}
            className="rounded-xl p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
            aria-label="Luna următoare"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day name headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAY_ABBREVIATIONS.map((abbr) => (
          <div
            key={abbr}
            className="py-2 text-center font-semibold text-gray-500 uppercase"
            style={{ fontSize: "0.72rem" }}
          >
            {abbr}
          </div>
        ))}
      </div>

      {/* Day cells grid — AnimatePresence for month transitions */}
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
                  className="rounded-xl"
                  style={{ minHeight: 60, background: "rgba(255,255,255,0.01)" }}
                />
              );
            }

            const dateKey = buildDateKey(year, month, day);
            const dayEvents = events.filter((e) => getEventDateKey(e) === dateKey);
            const isToday = isCurrentMonth && day === today.day;
            const isSelected = day === selectedDay;
            const isPast =
              year < today.year ||
              (year === today.year && month < today.month) ||
              (year === today.year && month === today.month && day < today.day);
            const displayDots = dayEvents.slice(0, 3);
            const extraCount = dayEvents.length - 3;

            return (
              <motion.button
                key={`day-${day}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDaySelect(day)}
                className={[
                  "relative flex cursor-pointer flex-col items-center rounded-xl py-2 transition-colors",
                  isToday ? "ring-2" : "",
                  isSelected && !isToday ? "ring-accent-500/40 bg-white/[0.04] ring-1" : "",
                  !isToday && !isSelected ? "hover:bg-white/[0.04]" : "",
                  isPast && !isToday ? "opacity-40" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  minHeight: 60,
                  ...(isToday
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.1))",
                        ringColor: "rgba(236,72,153,0.4)",
                      }
                    : {}),
                }}
              >
                {/* Day number */}
                <span
                  className={isToday ? "font-bold text-pink-400" : "text-gray-300"}
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
