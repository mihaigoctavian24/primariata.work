"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { CalEvent } from "@/store/calendar-store";

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventCreate: (event: Omit<CalEvent, "id">) => void;
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

export function CreateEventModal({
  open,
  onClose,
  onEventCreate,
}: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Ședință");
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    onEventCreate({
      title: title.trim(),
      date,
      time: time || "00:00",
      type: type || "Eveniment",
      location: location.trim(),
      color: color || "bg-pink-500",
    });

    // Reset form
    setTitle("");
    setDate("");
    setTime("");
    setLocation("");
    setType("Ședință");
    setColor(COLORS[0]);
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Eveniment Nou</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/5 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1">
                <label htmlFor="title" className="text-sm font-medium">
                  Titlu Eveniment <span className="text-red-400">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Ședință Consiliu Local"
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="date" className="text-sm font-medium">
                    Dată <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="time" className="text-sm font-medium">Ora</label>
                  <input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    style={{ colorScheme: "dark" }}
                    className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="location" className="text-sm font-medium">Locație (opțional)</label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Sala Mare"
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="type" className="text-sm font-medium">Tip Eveniment</label>
                <input
                  id="type"
                  type="text"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Ex: Ședință"
                  className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                />
              </div>

              <div className="space-y-2 mt-2">
                <label className="text-sm font-medium">Culoare Etichetă</label>
                <div className="flex gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full ${c} cursor-pointer transition-all ${
                        color === c 
                          ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110" 
                          : "hover:scale-110"
                      }`}
                      aria-label={`Select color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-[linear-gradient(110deg,var(--accent-500),var(--accent-600))] hover:bg-[linear-gradient(110deg,var(--accent-400),var(--accent-500))] text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-accent-500/20 active:scale-[0.98]"
              >
                Salvează Evenimentul
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
