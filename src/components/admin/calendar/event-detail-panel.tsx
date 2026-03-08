"use client";

import { motion, AnimatePresence } from "framer-motion";
import { format, isAfter, isSameDay } from "date-fns";
import { ro } from "date-fns/locale";
import { CalendarDays, Clock, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { CalEvent } from "@/store/calendar-store";

interface EventDetailPanelProps {
  selectedDay: number | null;
  year: number;
  month: number;
  events: CalEvent[];
  onEventRemove: (id: string) => void;
  onDaySelect: (day: number) => void;
}

const DOT_COLOR_MAP: Record<string, string> = {
  "bg-pink-500": "#ec4899",
  "bg-red-500": "#ef4444",
  "bg-amber-500": "#f59e0b",
  "bg-sky-500": "#0ea5e9",
  "bg-blue-500": "#3b82f6",
  "bg-violet-500": "#8b5cf6",
  "bg-emerald-500": "#10b981",
  "bg-cyan-500": "#06b6d4",
  "bg-orange-500": "#f97316",
};

export function EventDetailPanel({
  selectedDay,
  year,
  month,
  events,
  onEventRemove,
  onDaySelect,
}: EventDetailPanelProps) {
  // Format selected date
  const selectedDate = selectedDay
    ? new Date(year, month, selectedDay)
    : new Date();
  const selectedDateStr = format(selectedDate, "d MMMM yyyy", { locale: ro });

  // Filter events for selected day
  const selectedDayEvents = events.filter((e) => {
    const eDate = new Date(e.date);
    return isSameDay(eDate, selectedDate);
  });

  // Upcoming events
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((e) => {
      const eDate = new Date(e.date);
      return isAfter(eDate, today) || isSameDay(eDate, today);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="col-span-1 lg:col-span-4 flex flex-col gap-4">
      {/* Selected Day Events Card */}
      <div className="bg-card/50 border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/[0.05]">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {selectedDateStr}
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground">
              {selectedDayEvents.length}
            </span>
          </h3>
        </div>

        <div className="p-4 flex flex-col gap-3 min-h-[200px]">
          <AnimatePresence mode="popLayout">
            {selectedDayEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground m-auto"
              >
                <div className="w-12 h-12 rounded-full bg-white/[0.05] flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 opacity-50" />
                </div>
                <p>Niciun eveniment programat</p>
                <p className="text-sm opacity-60">
                  Alegeți altă zi sau adăugați un eveniment nou.
                </p>
              </motion.div>
            ) : (
              selectedDayEvents.map((evt) => {
                const hexColor = DOT_COLOR_MAP[evt.color] ?? "#6b7280";

                return (
                  <motion.div
                    key={evt.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="group relative bg-white/[0.03] border border-white/[0.05] rounded-xl p-4 overflow-hidden"
                    style={{ borderLeft: `3px solid ${hexColor}` }}
                  >
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          onEventRemove(evt.id);
                          toast.success("Eveniment șters cu succes");
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-md text-muted-foreground hover:text-red-400 transition-colors"
                        title="Șterge evenimentul"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <h4 className="font-medium text-sm pr-6 mb-2">{evt.title}</h4>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 opacity-70" />
                        <span>{evt.time}</span>
                      </div>
                      
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 opacity-70" />
                          <span>{evt.location}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 opacity-70" />
                        <span>{evt.type}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upcoming Events Card */}
      <div className="bg-card/50 border border-white/[0.05] rounded-2xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/[0.05]">
          <h3 className="text-lg font-semibold">Următoarele Evenimente</h3>
        </div>

        <div className="p-4 flex flex-col gap-2">
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm p-4 text-center">
              Nu aveți evenimente programate în viitor.
            </p>
          ) : (
            upcomingEvents.map((evt) => {
              const hexColor = DOT_COLOR_MAP[evt.color] ?? "#6b7280";
              const evtDate = new Date(evt.date);
              
              return (
                <button
                  key={evt.id}
                  onClick={() => {
                    // Update main calendar view to this month/year if needed
                    // For simply navigating day:
                    onDaySelect(evtDate.getDate());
                  }}
                  className="w-full text-left flex items-start gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors border border-transparent"
                >
                  <div
                    className="w-1 flex-shrink-0 h-full min-h-[40px] rounded-full"
                    style={{ background: hexColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{evt.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(evtDate, "d MMM", { locale: ro })} • {evt.time}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
