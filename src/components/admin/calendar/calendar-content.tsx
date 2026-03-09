"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, Plus } from "lucide-react";

import { events } from "./calendar-data";
import { CalendarGrid } from "./calendar-grid";
import { EventDetailPanel } from "./event-detail-panel";
import { CreateEventModal } from "./create-event-modal";

// ─── Component ────────────────────────────────────────

export function CalendarContent() {
  const [selectedDay, setSelectedDay] = useState<number | null>(4);
  const [showNewEvent, setShowNewEvent] = useState(false);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-white"
            style={{ fontSize: "1.6rem", fontWeight: 700 }}
          >
            <CalendarDays className="h-6 w-6 text-sky-400" /> Calendar
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
          onClick={() => setShowNewEvent(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-white"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
            boxShadow: "0 4px 15px rgba(59,130,246,0.25)",
          }}
        >
          <Plus className="h-4 w-4" />
          <span style={{ fontSize: "0.85rem" }}>Eveniment Nou</span>
        </motion.button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-5">
        <CalendarGrid events={events} selectedDay={selectedDay} onDaySelect={setSelectedDay} />
        <EventDetailPanel selectedDay={selectedDay} events={events} onDaySelect={setSelectedDay} />
      </div>

      {/* Modal */}
      <CreateEventModal open={showNewEvent} onClose={() => setShowNewEvent(false)} />
    </div>
  );
}
