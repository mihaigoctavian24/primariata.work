"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalEvent } from "@/store/calendar-store";

interface CalendarGridProps {
  year: number;
  month: number; // 0-indexed (0 = January)
  events: CalEvent[];
  selectedDay: number | null;
  onDaySelect: (day: number) => void;
  onMonthChange: (direction: "prev" | "next" | "today") => void;
}

const DAYS_OF_WEEK = ["LUN", "MAR", "MIE", "JOI", "VIN", "SÂM", "DUM"];

// Get calendar days for the current month (Monday-start grid)
function getMonthCalendar(year: number, month: number): (number | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Convert Sunday=0 to Monday=0, Sunday=6
  const offset = (firstDayOfMonth + 6) % 7;
  
  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }
  return days;
}

export function CalendarGrid({
  year,
  month,
  events,
  selectedDay,
  onDaySelect,
  onMonthChange,
}: CalendarGridProps) {
  const calendarDays = getMonthCalendar(year, month);
  
  // Format month name (e.g., "Martie")
  const monthName = new Intl.DateTimeFormat("ro-RO", { month: "long" })
    .format(new Date(year, month))
    .replace(/^./, (str) => str.toUpperCase());

  // Current system date for "Today" highlighting
  const todayDate = new Date();
  const isCurrentMonthYear = 
    todayDate.getFullYear() === year && todayDate.getMonth() === month;
  const todayDayNumber = todayDate.getDate();

  return (
    <div className="col-span-1 lg:col-span-8 bg-white/[0.025] border border-white/[0.05] rounded-2xl p-4 sm:p-5 flex flex-col">
      {/* Header: Month/Year Nav */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight">
          {monthName} <span className="text-muted-foreground font-normal">{year}</span>
        </h2>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onMonthChange("prev")}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onMonthChange("today")}
            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
          >
            Azi
          </button>
          <button
            onClick={() => onMonthChange("next")}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {DAYS_OF_WEEK.map((dayName) => (
          <div key={dayName} className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider py-2">
            {dayName}
          </div>
        ))}
      </div>

      {/* Grid Cells */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr">
        {calendarDays.map((dayNumber, i) => {
          if (dayNumber === null) {
            return (
              <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[80px] bg-transparent rounded-xl" />
            );
          }

          const isToday = isCurrentMonthYear && dayNumber === todayDayNumber;
          const isSelected = selectedDay === dayNumber;
          const isPast = isCurrentMonthYear && dayNumber < todayDayNumber;
          
          // Format current cell date to ISO for matching events
          const cellDateIso = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
          const dayEvents = events.filter((e) => e.date === cellDateIso);
          const maxVisibleDots = 3;

          return (
            <motion.button
              key={`day-${dayNumber}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDaySelect(dayNumber)}
              className={cn(
                "relative flex flex-col items-start min-h-[60px] sm:min-h-[80px] p-2 rounded-xl border border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isToday 
                  ? "text-pink-400 font-bold border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]" 
                  : "hover:bg-white/[0.04]",
                isSelected && !isToday && "bg-white/[0.04] ring-1 ring-accent-500/40 border-accent-500/20",
                !isToday && "text-foreground font-medium",
                isPast && !isToday && "opacity-40 hover:opacity-100 focus-visible:opacity-100"
              )}
              style={
                isToday
                  ? { background: "linear-gradient(135deg, rgba(236,72,153,0.15), rgba(139,92,246,0.1))" }
                  : undefined
              }
            >
              <span className="text-sm self-end">{dayNumber}</span>
              
              {/* Event Dots Container */}
              <div className="mt-auto flex gap-1 pt-1 pb-0.5 max-w-full flex-wrap">
                {dayEvents.slice(0, maxVisibleDots).map((evt) => (
                  <div
                    key={evt.id}
                    className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", evt.color)}
                    title={evt.title}
                  />
                ))}
                {dayEvents.length > maxVisibleDots && (
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-muted-foreground flex items-center justify-center text-[8px]" title={`+${dayEvents.length - maxVisibleDots} mai multe`} />
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
