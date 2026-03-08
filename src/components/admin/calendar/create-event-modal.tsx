"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, X } from "lucide-react";
import type { CalEvent } from "@/store/calendar-store";

// ============================================================================
// Types
// ============================================================================

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventCreate: (event: Omit<CalEvent, "id">) => void;
}

// ============================================================================
// Color picker options — stores Tailwind class strings (not hex)
// ============================================================================

const COLOR_OPTIONS: { label: string; tailwind: string }[] = [
  { label: "Roz", tailwind: "bg-pink-500" },
  { label: "Roșu", tailwind: "bg-red-500" },
  { label: "Portocaliu", tailwind: "bg-amber-500" },
  { label: "Albastru", tailwind: "bg-blue-500" },
  { label: "Violet", tailwind: "bg-violet-500" },
  { label: "Verde", tailwind: "bg-emerald-500" },
  { label: "Cyan", tailwind: "bg-cyan-500" },
];

// ============================================================================
// CreateEventModal
// ============================================================================

export function CreateEventModal({
  open,
  onClose,
  onEventCreate,
}: CreateEventModalProps): React.JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("09:00");
  const [location, setLocation] = useState<string>("");
  const [type, setType] = useState<string>("Ședință");
  const [color, setColor] = useState<string>("bg-pink-500");
  const [titleError, setTitleError] = useState<string>("");
  const [dateError, setDateError] = useState<string>("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      setTitle("");
      setDate(todayStr);
      setTime("09:00");
      setLocation("");
      setType("Ședință");
      setColor("bg-pink-500");
      setTitleError("");
      setDateError("");
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    let valid = true;

    if (!title.trim() || title.trim().length < 2) {
      setTitleError("Titlul e obligatoriu (minim 2 caractere)");
      valid = false;
    } else {
      setTitleError("");
    }

    if (!date) {
      setDateError("Data e obligatorie");
      valid = false;
    } else {
      setDateError("");
    }

    if (!valid) return;

    onEventCreate({
      title: title.trim(),
      date, // ISO date string "YYYY-MM-DD"
      time,
      color, // Tailwind class string
      type,
      location: location.trim() || undefined,
    });

    onClose();
  };

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
  } as const;

  const inputClass =
    "w-full rounded-xl px-3 py-2.5 text-white outline-none placeholder:text-gray-600 transition-all focus:border-accent-500/40";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{
              background: "var(--surface-raised, #1a1a2e)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="text-accent-500 h-4 w-4" />
                <h3 className="font-semibold text-white" style={{ fontSize: "1rem" }}>
                  Eveniment Nou
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {/* Title */}
              <div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titlu eveniment *"
                  className={inputClass}
                  style={{ ...inputStyle, fontSize: "0.9rem" }}
                />
                {titleError && <p className="mt-1 text-xs text-red-400">{titleError}</p>}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={inputClass}
                    style={{ ...inputStyle, fontSize: "0.85rem", colorScheme: "dark" }}
                  />
                  {dateError && <p className="mt-1 text-xs text-red-400">{dateError}</p>}
                </div>
                <div>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={inputClass}
                    style={{ ...inputStyle, fontSize: "0.85rem", colorScheme: "dark" }}
                  />
                </div>
              </div>

              {/* Type */}
              <div>
                <input
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Tip eveniment (ex: Ședință)"
                  className={inputClass}
                  style={{ ...inputStyle, fontSize: "0.88rem" }}
                />
              </div>

              {/* Location */}
              <div>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Locație (opțional)"
                  className={inputClass}
                  style={{ ...inputStyle, fontSize: "0.9rem" }}
                />
              </div>

              {/* Color picker */}
              <div>
                <p className="mb-2 text-gray-500" style={{ fontSize: "0.75rem" }}>
                  Culoare eveniment
                </p>
                <div className="flex items-center gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.tailwind}
                      type="button"
                      aria-label={opt.label}
                      onClick={() => setColor(opt.tailwind)}
                      className={`h-8 w-8 cursor-pointer rounded-full transition-all ${opt.tailwind} ${
                        color === opt.tailwind
                          ? "ring-offset-card scale-110 ring-2 ring-white ring-offset-2"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-white"
                style={{
                  background: "var(--accent-gradient)",
                  fontSize: "0.88rem",
                }}
              >
                Salvează Evenimentul
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
