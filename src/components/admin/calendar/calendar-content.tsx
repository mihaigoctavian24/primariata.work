"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCalendarStore } from "@/store/calendar-store";
import type { CalEvent } from "@/store/calendar-store";
import { CalendarGrid } from "./calendar-grid";
import { EventDetailPanel } from "./event-detail-panel";
import { CreateEventModal } from "./create-event-modal";
import { EditEventModal } from "./edit-event-modal";

export function CalendarContent() {
  const { events, addEvent, removeEvent, updateEvent } = useCalendarStore();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalEvent | null>(null);

  const handleMonthChange = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentYear(today.getFullYear());
      setCurrentMonth(today.getMonth());
      setSelectedDay(today.getDate());
      return;
    }

    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleEventCreate = (e: Omit<CalEvent, "id">) => {
    if (!e.recurrence || e.recurrence === "none") {
      addEvent(e);
      return;
    }

    const baseDate = new Date(e.date);
    let count = 0;
    
    if (e.recurrence === "zilnic") count = 30;
    else if (e.recurrence === "saptamanal") count = 12;
    else if (e.recurrence === "lunar") count = 6;

    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      if (e.recurrence === "zilnic") {
        d.setDate(d.getDate() + i);
      } else if (e.recurrence === "saptamanal") {
        d.setDate(d.getDate() + i * 7);
      } else if (e.recurrence === "lunar") {
        d.setMonth(d.getMonth() + i);
      }
      
      const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      
      addEvent({
        ...e,
        date: isoDate,
        // Mark as part of a recurring series if needed in UI, but the plan only specified creating N independent instances.
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-6 max-w-7xl mx-auto w-full"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-sky-400" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Evenimente, deadlines și ședințe programate pentru Primărie.
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-[linear-gradient(110deg,#38bdf8,#818cf8)] hover:brightness-110 text-white font-medium py-2 px-4 rounded-xl transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Eveniment Nou</span>
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-2">
        <CalendarGrid
          year={currentYear}
          month={currentMonth}
          events={events}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
          onMonthChange={handleMonthChange}
        />
        
        <EventDetailPanel
          selectedDay={selectedDay}
          year={currentYear}
          month={currentMonth}
          events={events}
          onEventRemove={removeEvent}
          onEventEdit={setEditingEvent}
          onDaySelect={(day) => setSelectedDay(day)}
        />
      </div>

      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreate={(e) => {
          handleEventCreate(e);
          toast.success(
            e.recurrence && e.recurrence !== "none"
              ? "Evenimente recurente adăugate!"
              : "Eveniment adăugat!"
          );
          setShowCreateModal(false);
          
          // Auto-select the day of the new event if it's in the current month view
          const evtDate = new Date(e.date);
          if (evtDate.getFullYear() === currentYear && evtDate.getMonth() === currentMonth) {
            setSelectedDay(evtDate.getDate());
          }
        }}
      />

      <EditEventModal
        open={!!editingEvent}
        event={editingEvent}
        onClose={() => setEditingEvent(null)}
        onEventUpdate={(id, updates) => {
          updateEvent(id, updates);
          toast.success("Eveniment actualizat cu succes!");
          setEditingEvent(null);
        }}
        onEventDelete={(id) => {
          removeEvent(id);
          toast.success("Eveniment șters cu succes!");
          setEditingEvent(null);
        }}
      />
    </motion.div>
  );
}
