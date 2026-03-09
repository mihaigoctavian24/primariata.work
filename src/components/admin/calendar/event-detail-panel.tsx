"use client";

import { motion, AnimatePresence } from "motion/react";
import { Clock, MapPin, CalendarDays } from "lucide-react";

import type { CalEvent } from "./calendar-data";
import { TODAY } from "./calendar-data";

// ─── Props ────────────────────────────────────────────

interface EventDetailPanelProps {
  selectedDay: number | null;
  events: CalEvent[];
  onDaySelect: (day: number) => void;
}

// ─── Component ────────────────────────────────────────

export function EventDetailPanel({ selectedDay, events, onDaySelect }: EventDetailPanelProps) {
  const selectedEvents = selectedDay ? events.filter((e) => e.date === selectedDay) : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="col-span-4 flex flex-col gap-4"
    >
      {/* Selected Day */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>
            {selectedDay ? `${selectedDay} Martie 2026` : "Selectează o zi"}
          </h3>
          {selectedDay && (
            <span className="text-gray-600" style={{ fontSize: "0.72rem" }}>
              {selectedEvents.length} {selectedEvents.length === 1 ? "eveniment" : "evenimente"}
            </span>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {selectedEvents.length > 0 ? (
            selectedEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-3 rounded-xl p-3"
                style={{ background: `${event.color}08`, border: `1px solid ${event.color}15` }}
              >
                <div className="mb-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full" style={{ background: event.color }} />
                  <span className="text-white" style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                    {event.title}
                  </span>
                </div>
                <div className="ml-4 flex flex-col gap-1.5">
                  <div
                    className="flex items-center gap-1.5 text-gray-400"
                    style={{ fontSize: "0.75rem" }}
                  >
                    <Clock className="h-3 w-3" /> {event.time}
                  </div>
                  {event.location && (
                    <div
                      className="flex items-center gap-1.5 text-gray-400"
                      style={{ fontSize: "0.75rem" }}
                    >
                      <MapPin className="h-3 w-3" /> {event.location}
                    </div>
                  )}
                  <div
                    className="flex items-center gap-1.5 text-gray-400"
                    style={{ fontSize: "0.75rem" }}
                  >
                    <CalendarDays className="h-3 w-3" /> {event.type}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 text-center text-gray-700"
            >
              <CalendarDays className="mx-auto mb-2 h-8 w-8 opacity-30" />
              <p style={{ fontSize: "0.85rem" }}>Niciun eveniment</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h3 className="mb-3 text-white" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
          Următoarele Evenimente
        </h3>
        {events
          .filter((e) => e.date >= TODAY)
          .slice(0, 5)
          .map((event) => (
            <button
              key={event.id}
              onClick={() => onDaySelect(event.date)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-1 py-2 text-left transition-all hover:bg-white/[0.02]"
            >
              <div className="h-8 w-1 rounded-full" style={{ background: event.color }} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-gray-200" style={{ fontSize: "0.82rem" }}>
                  {event.title}
                </div>
                <div className="text-gray-600" style={{ fontSize: "0.7rem" }}>
                  {event.date} Mar · {event.time}
                </div>
              </div>
            </button>
          ))}
      </div>
    </motion.div>
  );
}
