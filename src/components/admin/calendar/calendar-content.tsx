"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useCalendarEventsStore, EVENT_TYPE_COLORS } from "@/store/calendar-events-store";
import { CalendarGrid } from "@/components/admin/calendar/calendar-grid";
import { EventDetailPanel } from "@/components/admin/calendar/event-detail-panel";
import { CreateEventModal } from "@/components/admin/calendar/create-event-modal";
import type { CalEvent } from "@/store/calendar-events-store";

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

// ============================================================================
// CalendarContent — root Client Component, reads from Zustand store
// ============================================================================

export function CalendarContent(): React.JSX.Element {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getFullYear());
  const [month, setMonth] = useState<number>(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const { events, addEvent, deleteEvent } = useCalendarEventsStore();

  const today = {
    year: now.getFullYear(),
    month: now.getMonth(),
    day: now.getDate(),
  };

  // ============================================================
  // Month navigation
  // ============================================================

  const goToPrevMonth = (): void => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = (): void => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = (): void => {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(now.getDate());
  };

  // ============================================================
  // Event handlers
  // ============================================================

  const handleSaveEvent = (event: Omit<CalEvent, "id">): void => {
    addEvent({
      ...event,
      color: EVENT_TYPE_COLORS[event.type] ?? "bg-gray-500 text-white",
    });
  };

  const handleDeleteEvent = (id: string): void => {
    deleteEvent(id);
  };

  const handleOpenCreateModal = (): void => {
    setShowCreateModal(true);
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <CalendarDays className="text-accent-500 h-6 w-6" />
            Calendar
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="mt-1 text-gray-600"
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
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-white"
          style={{
            background: "var(--accent-gradient)",
            boxShadow: "0 4px 15px rgba(var(--accent-500-rgb, 59 130 246) / 0.25)",
          }}
        >
          <span style={{ fontSize: "0.85rem" }}>+ Adaugă Eveniment</span>
        </motion.button>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-5">
        {/* Left: Calendar grid card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Month navigation */}
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-bold text-white" style={{ fontSize: "1.2rem" }}>
              {ROMANIAN_MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevMonth}
                className="rounded-xl p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
                aria-label="Luna precedentă"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToToday}
                className="text-accent-500 hover:bg-accent-500/10 rounded-xl px-3 py-1.5 transition-all"
                style={{ fontSize: "0.82rem" }}
              >
                Azi
              </button>
              <button
                onClick={goToNextMonth}
                className="rounded-xl p-2 text-gray-500 transition-all hover:bg-white/5 hover:text-white"
                aria-label="Luna următoare"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <CalendarGrid
            year={year}
            month={month}
            events={events}
            selectedDay={selectedDay}
            onDayClick={setSelectedDay}
            today={today}
          />
        </motion.div>

        {/* Right: Day detail panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="shrink-0"
          style={{ width: 340 }}
        >
          <EventDetailPanel
            day={selectedDay}
            year={year}
            month={month}
            events={events}
            onAddEvent={handleOpenCreateModal}
            onDeleteEvent={handleDeleteEvent}
          />
        </motion.div>
      </div>

      {/* Create event modal */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveEvent}
        defaultDay={selectedDay}
        year={year}
        month={month}
      />
    </div>
  );
}
