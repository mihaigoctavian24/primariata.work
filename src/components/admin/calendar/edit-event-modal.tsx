"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalEvent } from "@/store/calendar-store";

export interface EditEventModalProps {
  open: boolean;
  event: CalEvent | null;
  onClose: () => void;
  onEventUpdate: (id: string, updates: Partial<Omit<CalEvent, "id">>) => void;
  onEventDelete: (id: string) => void;
}

const COLORS = [
  "bg-pink-500",
  "bg-red-500",
  "bg-amber-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-cyan-500",
];

const EVENT_TYPES = ["Ședință", "Audit", "Training", "Termen", "Eveniment", "Personal"];

export function EditEventModal({
  open,
  event,
  onClose,
  onEventUpdate,
  onEventDelete,
}: EditEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Ședință");
  const [color, setColor] = useState(COLORS[0] as string);

  // Pre-populate form when event changes
  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDate(event.date || "");
      setTime(event.time || "");
      setLocation(event.location || "");
      setType(event.type || "Eveniment");
      setColor(event.color || COLORS[0] as string);
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !title.trim() || !date) return;

    onEventUpdate(event.id, {
      title: title.trim(),
      date,
      time: time || "00:00",
      type: type || "Eveniment",
      location: location.trim(),
      color: color || "bg-pink-500",
    });
  };

  const handleDelete = () => {
    if (!event) return;
    onEventDelete(event.id);
  };

  return (
    <AnimatePresence>
      {open && event && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]"
            style={{ background: "var(--surface-raised, var(--card))" }}
          >
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-semibold">Editează Eveniment</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/5 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-1 min-h-0 hide-scrollbar pb-2">
              <form id="edit-event-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-1.5">
                  <label htmlFor="edit-title" className="text-sm font-medium">
                    Titlu Eveniment <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="edit-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Ședință Consiliu Local"
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="edit-date" className="text-sm font-medium">
                      Dată <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="edit-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      style={{ colorScheme: "dark" }}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="edit-time" className="text-sm font-medium">Ora</label>
                    <input
                      id="edit-time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      style={{ colorScheme: "dark" }}
                      className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="edit-location" className="text-sm font-medium">Locație (opțional)</label>
                  <input
                    id="edit-location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Sala Mare"
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50 text-sm"
                  />
                </div>

                {/* Type selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tip Eveniment</label>
                  <div className="flex flex-wrap gap-2">
                    {EVENT_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          type === t
                            ? `${color.replace("bg-", "text-")} border-transparent shadow-sm bg-white/[0.1]`
                            : "text-muted-foreground border-border hover:bg-white/[0.05]"
                        )}
                        style={type === t ? { backgroundColor: "rgba(255,255,255,0.1)" } : {}}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color swatches */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Culoare</label>
                  <div className="flex flex-wrap gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={cn(
                          "w-7 h-7 rounded-full cursor-pointer transition-all",
                          c,
                          color === c
                            ? "ring-2 ring-white/60 ring-offset-2 ring-offset-card scale-110"
                            : "hover:scale-110 opacity-80 hover:opacity-100"
                        )}
                        aria-label={`Select color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="pt-4 mt-2 border-t border-border shrink-0 flex gap-3">
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-3 rounded-xl transition-colors font-medium text-sm border border-red-500/20"
              >
                <Trash2 className="w-4 h-4" />
                Șterge
              </button>
              
              <button
                type="submit"
                form="edit-event-form"
                className="flex-1 bg-[linear-gradient(110deg,var(--accent-500),var(--accent-600))] hover:bg-[linear-gradient(110deg,var(--accent-400),var(--accent-500))] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-accent-500/20 active:scale-[0.98] text-sm"
              >
                Salvează Modificările
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
