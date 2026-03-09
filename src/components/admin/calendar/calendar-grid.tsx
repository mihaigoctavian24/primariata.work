"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { CalEvent } from "./calendar-data";
import { daysOfWeek, DAYS_IN_MONTH, FIRST_DAY_OFFSET, TODAY } from "./calendar-data";

// ─── Props ────────────────────────────────────────────

interface CalendarGridProps {
  events: CalEvent[];
  selectedDay: number | null;
  onDaySelect: (day: number) => void;
}

// ─── Component ────────────────────────────────────────

export function CalendarGrid({ events, selectedDay, onDaySelect }: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < FIRST_DAY_OFFSET; i++) days.push(null);
    for (let i = 1; i <= DAYS_IN_MONTH; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-8 rounded-2xl p-5"
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Month nav */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-white" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
          Martie 2026
        </h2>
        <div className="flex items-center gap-1">
          <button className="cursor-pointer rounded-xl p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            className="cursor-pointer rounded-xl px-3 py-1.5 text-pink-400 transition-all hover:bg-pink-400/10"
            style={{ fontSize: "0.82rem" }}
          >
            Azi
          </button>
          <button className="cursor-pointer rounded-xl p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {daysOfWeek.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-gray-600"
            style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dayEvents = events.filter((e) => e.date === day);
          const isToday = day === TODAY;
          const isSelected = day === selectedDay;
          const isPast = day < TODAY;

          return (
            <motion.button
              key={`day-${day}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDaySelect(day)}
              className={`relative flex cursor-pointer flex-col items-center rounded-xl py-2 transition-all ${
                isSelected ? "ring-1 ring-pink-500/40" : ""
              } ${isPast ? "opacity-40" : ""}`}
              style={{
                background: isToday
                  ? "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.1))"
                  : isSelected
                    ? "rgba(255,255,255,0.04)"
                    : "transparent",
                minHeight: 60,
              }}
            >
              <span
                className={`${isToday ? "text-pink-400" : "text-gray-300"}`}
                style={{ fontSize: "0.88rem", fontWeight: isToday ? 700 : 400 }}
              >
                {day}
              </span>
              <div className="mt-1 flex gap-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: e.color }}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
