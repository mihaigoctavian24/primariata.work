"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useCalendarStore } from "@/store/calendar-store";
import { CalendarGrid } from "@/components/admin/calendar/calendar-grid";
import { EventDetailPanel } from "@/components/admin/calendar/event-detail-panel";
import { CreateEventModal } from "@/components/admin/calendar/create-event-modal";
import type { CalEvent } from "@/store/calendar-store";

// ============================================================================
// CalendarContent — Client Component coordinator
// Reads from Zustand calendar store; no props needed
// ============================================================================

export function CalendarContent(): React.JSX.Element {
  const now = new Date();

  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const { events, addEvent, removeEvent } = useCalendarStore();

  // ============================================================
  // Month navigation — handles year rollover
  // ============================================================

  const prevMonth = (): void => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = (): void => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = (): void => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  // ============================================================
  // Event handlers
  // ============================================================

  const handleMonthChange = (dir: "prev" | "next"): void => {
    if (dir === "prev") {
      prevMonth();
    } else {
      nextMonth();
    }
  };

  const handleEventCreate = (event: Omit<CalEvent, "id">): void => {
    addEvent(event);
    toast.success("Eveniment adăugat!");
  };

  // Filter events to only those in the current month/year (for the grid)
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const currentMonthEvents = events.filter((e) => e.date.startsWith(monthPrefix));

  // ============================================================
  // Render
  // ============================================================

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <CalendarDays className="h-6 w-6 text-sky-400" />
            Calendar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.06 }}
            className="mt-1 text-gray-500"
            style={{ fontSize: "0.83rem" }}
          >
            Evenimente, deadlines și ședințe programate
          </motion.p>
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-white"
          style={{
            background: "var(--accent-gradient)",
            boxShadow: "0 4px 15px rgba(var(--accent-500-rgb, 59 130 246) / 0.25)",
            fontSize: "0.85rem",
          }}
        >
          + Eveniment Nou
        </motion.button>
      </div>

      {/* Two-column grid layout */}
      <div className="grid grid-cols-12 gap-5">
        {/* Calendar grid — col-span-8 */}
        <CalendarGrid
          year={year}
          month={month}
          events={currentMonthEvents}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
          onMonthChange={handleMonthChange}
          onTodayClick={goToToday}
        />

        {/* Event detail panel — col-span-4 */}
        <EventDetailPanel
          selectedDay={selectedDay}
          year={year}
          month={month}
          events={events}
          onEventRemove={removeEvent}
          onDaySelect={setSelectedDay}
        />
      </div>

      {/* Create event modal */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreate={handleEventCreate}
      />
    </motion.div>
  );
}
