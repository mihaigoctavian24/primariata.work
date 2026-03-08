import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus,
  Clock, MapPin, Users, X,
} from "lucide-react";

interface CalEvent {
  id: string;
  title: string;
  date: number; // day of month
  time: string;
  color: string;
  type: string;
  location?: string;
}

const events: CalEvent[] = [
  { id: "e1", title: "Ședință Consiliu Local", date: 4, time: "10:00", color: "#ec4899", type: "Ședință", location: "Sala Mare" },
  { id: "e2", title: "Deadline cerere #1839", date: 5, time: "17:00", color: "#ef4444", type: "Deadline" },
  { id: "e3", title: "Audit documente Q1", date: 7, time: "09:00", color: "#f59e0b", type: "Audit", location: "Biroul 3" },
  { id: "e4", title: "Întâlnire contribuabili", date: 10, time: "14:00", color: "#3b82f6", type: "Întâlnire", location: "Sala Conferințe" },
  { id: "e5", title: "Review buget lunar", date: 12, time: "11:00", color: "#8b5cf6", type: "Review" },
  { id: "e6", title: "Training funcționari noi", date: 14, time: "09:30", color: "#10b981", type: "Training", location: "Sala IT" },
  { id: "e7", title: "Vizită teren str. Aviatorilor", date: 18, time: "08:00", color: "#06b6d4", type: "Vizită" },
  { id: "e8", title: "Ședință buget Q2", date: 21, time: "10:00", color: "#ec4899", type: "Ședință", location: "Sala Mare" },
  { id: "e9", title: "Evaluare personal", date: 25, time: "14:00", color: "#f59e0b", type: "Evaluare" },
  { id: "e10", title: "Deadline raport lunar", date: 28, time: "23:59", color: "#ef4444", type: "Deadline" },
];

const daysOfWeek = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(4);
  const [month] = useState(2); // March 2026 (0-indexed)
  const [showNewEvent, setShowNewEvent] = useState(false);

  const today = 4;
  const daysInMonth = 31; // March
  const firstDayOffset = 6; // March 1, 2026 is Sunday → offset 6 in Mon-start week

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDayOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, []);

  const selectedEvents = selectedDay ? events.filter((e) => e.date === selectedDay) : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="text-white flex items-center gap-2" style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            <CalendarDays className="w-6 h-6 text-sky-400" /> Calendar
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-gray-600 mt-1" style={{ fontSize: "0.83rem" }}>
            Evenimente, deadlines și ședințe programate
          </motion.p>
        </div>
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowNewEvent(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-white"
          style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", boxShadow: "0 4px 15px rgba(59,130,246,0.25)" }}
        >
          <Plus className="w-4 h-4" />
          <span style={{ fontSize: "0.85rem" }}>Eveniment Nou</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-8 rounded-2xl p-5"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white" style={{ fontSize: "1.2rem", fontWeight: 700 }}>Martie 2026</h2>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="px-3 py-1.5 rounded-xl text-pink-400 hover:bg-pink-400/10 cursor-pointer transition-all" style={{ fontSize: "0.82rem" }}>Azi</button>
              <button className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white cursor-pointer transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center text-gray-600 py-2" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const dayEvents = events.filter((e) => e.date === day);
              const isToday = day === today;
              const isSelected = day === selectedDay;
              const isPast = day < today;

              return (
                <motion.button
                  key={`day-${day}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(day)}
                  className={`relative flex flex-col items-center py-2 rounded-xl cursor-pointer transition-all ${
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
                  <div className="flex gap-0.5 mt-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Event Detail Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-4 flex flex-col gap-4"
        >
          {/* Selected Day */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-4">
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
                    className="mb-3 p-3 rounded-xl"
                    style={{ background: `${event.color}08`, border: `1px solid ${event.color}15` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: event.color }} />
                      <span className="text-white" style={{ fontSize: "0.88rem", fontWeight: 500 }}>{event.title}</span>
                    </div>
                    <div className="flex flex-col gap-1.5 ml-4">
                      <div className="flex items-center gap-1.5 text-gray-400" style={{ fontSize: "0.75rem" }}>
                        <Clock className="w-3 h-3" /> {event.time}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 text-gray-400" style={{ fontSize: "0.75rem" }}>
                          <MapPin className="w-3 h-3" /> {event.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-gray-400" style={{ fontSize: "0.75rem" }}>
                        <CalendarDays className="w-3 h-3" /> {event.type}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 text-gray-700">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p style={{ fontSize: "0.85rem" }}>Niciun eveniment</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Upcoming */}
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <h3 className="text-white mb-3" style={{ fontSize: "0.9rem", fontWeight: 600 }}>Următoarele Evenimente</h3>
            {events
              .filter((e) => e.date >= today)
              .slice(0, 5)
              .map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedDay(event.date)}
                  className="w-full flex items-center gap-3 py-2 text-left cursor-pointer hover:bg-white/[0.02] transition-all rounded-lg px-1"
                >
                  <div className="w-1 h-8 rounded-full" style={{ background: event.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-200 truncate" style={{ fontSize: "0.82rem" }}>{event.title}</div>
                    <div className="text-gray-600" style={{ fontSize: "0.7rem" }}>{event.date} Mar · {event.time}</div>
                  </div>
                </button>
              ))}
          </div>
        </motion.div>
      </div>

      {/* New Event Modal */}
      <AnimatePresence>
        {showNewEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowNewEvent(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl p-5"
              style={{ background: "linear-gradient(180deg, #1a1a2e, #141424)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 25px 60px rgba(0,0,0,0.5)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white" style={{ fontSize: "1rem", fontWeight: 600 }}>Eveniment Nou</h3>
                <button onClick={() => setShowNewEvent(false)} className="p-1 rounded-lg hover:bg-white/5 text-gray-400 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex flex-col gap-3">
                <input placeholder="Titlu eveniment" className="px-3 py-2.5 rounded-xl bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" className="px-3 py-2.5 rounded-xl text-white outline-none" style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", colorScheme: "dark" }} />
                  <input type="time" className="px-3 py-2.5 rounded-xl text-white outline-none" style={{ fontSize: "0.85rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", colorScheme: "dark" }} />
                </div>
                <input placeholder="Locație (opțional)" className="px-3 py-2.5 rounded-xl bg-transparent text-white placeholder:text-gray-600 outline-none" style={{ fontSize: "0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <button onClick={() => { setShowNewEvent(false); }} className="px-4 py-2.5 rounded-xl text-white cursor-pointer" style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}>
                  Salvează
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
