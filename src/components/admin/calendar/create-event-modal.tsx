"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { X, Plus } from "lucide-react";
import type { CalEvent } from "@/store/calendar-events-store";
import { EVENT_TYPE_COLORS } from "@/store/calendar-events-store";

// ============================================================================
// Schema
// ============================================================================

const eventSchema = z.object({
  title: z.string().min(2, "Titlul e obligatoriu"),
  date: z.number().min(1, "Ziua e obligatorie").max(31, "Ziua maximă este 31"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM"),
  type: z.enum([
    "Ședință",
    "Deadline",
    "Audit",
    "Întâlnire",
    "Review",
    "Training",
    "Vizită",
    "Evaluare",
  ]),
  location: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

// ============================================================================
// Types
// ============================================================================

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalEvent, "id">) => void;
  defaultDay: number | null;
  year: number;
  month: number;
}

const EVENT_TYPES = [
  "Ședință",
  "Deadline",
  "Audit",
  "Întâlnire",
  "Review",
  "Training",
  "Vizită",
  "Evaluare",
] as const;

// ============================================================================
// CreateEventModal
// ============================================================================

export function CreateEventModal({
  open,
  onClose,
  onSave,
  defaultDay,
  year,
  month,
}: CreateEventModalProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      date: defaultDay ?? 1,
      time: "09:00",
      type: "Ședință",
      location: "",
    },
  });

  // Reset form when modal opens/closes or defaultDay changes
  useEffect(() => {
    if (open) {
      reset({
        title: "",
        date: defaultDay ?? 1,
        time: "09:00",
        type: "Ședință",
        location: "",
      });
    }
  }, [open, defaultDay, reset]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const onSubmit = (values: EventFormValues): void => {
    const color = EVENT_TYPE_COLORS[values.type] ?? "bg-gray-500 text-white";
    onSave({
      title: values.title,
      date: values.date,
      month,
      year,
      time: values.time,
      type: values.type,
      location: values.location || undefined,
      color,
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl p-5"
            style={{
              background: "var(--surface-raised, #1a1a2e)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="text-accent-500 h-4 w-4" />
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              {/* Title */}
              <div>
                <input
                  {...register("title")}
                  placeholder="Titlu eveniment *"
                  className={inputClass}
                  style={{ ...inputStyle, fontSize: "0.9rem" }}
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
                )}
              </div>

              {/* Date + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    {...register("date", { valueAsNumber: true })}
                    type="number"
                    min={1}
                    max={31}
                    placeholder="Zi *"
                    className={inputClass}
                    style={{ ...inputStyle, fontSize: "0.85rem" }}
                  />
                  {errors.date && (
                    <p className="mt-1 text-xs text-red-400">{errors.date.message}</p>
                  )}
                </div>
                <div>
                  <input
                    {...register("time")}
                    type="time"
                    placeholder="HH:MM *"
                    className={inputClass}
                    style={{ ...inputStyle, fontSize: "0.85rem", colorScheme: "dark" }}
                  />
                  {errors.time && (
                    <p className="mt-1 text-xs text-red-400">{errors.time.message}</p>
                  )}
                </div>
              </div>

              {/* Type */}
              <div>
                <select
                  {...register("type")}
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    fontSize: "0.88rem",
                    colorScheme: "dark",
                    cursor: "pointer",
                  }}
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <input
                  {...register("location")}
                  placeholder="Locație (opțional)"
                  className={inputClass}
                  style={{ ...inputStyle, fontSize: "0.9rem" }}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-medium text-white disabled:opacity-60"
                style={{
                  background: "var(--accent-gradient)",
                  fontSize: "0.88rem",
                }}
              >
                <Plus className="h-4 w-4" />
                Salvează Evenimentul
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
