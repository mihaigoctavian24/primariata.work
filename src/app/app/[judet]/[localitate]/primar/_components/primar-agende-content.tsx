"use client";

import React, { useState, useTransition, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X, Clock, Tag } from "lucide-react";
import {
  getPrimarAgendeData,
  createAgendaEvent,
  deleteAgendaEvent,
} from "@/actions/primar-actions";
import type { AgendaEventRow } from "@/actions/primar-actions";

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

const WEEKDAY_LABELS = ["Lu", "Ma", "Mi", "Jo", "Vi", "Sâ", "Du"] as const;

const TIP_COLORS: Record<AgendaEventRow["tip"], string> = {
  sedinta: "#3b82f6",
  audienta: "#f59e0b",
  eveniment: "#10b981",
  termen: "#ef4444",
};

const TIP_LABELS: Record<AgendaEventRow["tip"], string> = {
  sedinta: "Ședință",
  audienta: "Audiență",
  eveniment: "Eveniment",
  termen: "Termen",
};

const TIP_OPTIONS: AgendaEventRow["tip"][] = ["sedinta", "audienta", "eveniment", "termen"];

// ============================================================================
// Helpers
// ============================================================================

function getCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const offset = (firstDay.getDay() + 6) % 7; // Monday-start offset
  const days: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(d);
  }
  return days;
}

function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isToday(year: number, month: number, day: number): boolean {
  const now = new Date();
  return now.getFullYear() === year && now.getMonth() + 1 === month && now.getDate() === day;
}

// ============================================================================
// Types
// ============================================================================

interface PrimarAgendeContentProps {
  initialData: {
    success: boolean;
    data?: { events: AgendaEventRow[] };
    error?: string;
  };
  initialYear: number;
  initialMonth: number;
}

// ============================================================================
// Component
// ============================================================================

export function PrimarAgendeContent({
  initialData,
  initialYear,
  initialMonth,
}: PrimarAgendeContentProps): React.ReactElement {
  const [events, setEvents] = useState<AgendaEventRow[]>(initialData.data?.events ?? []);
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // --- Event lookup ---

  function getEventsForDay(day: number): AgendaEventRow[] {
    const dateStr = toIsoDate(currentYear, currentMonth, day);
    return events.filter((e) => e.data_eveniment === dateStr);
  }

  // --- Month navigation ---

  function handleMonthChange(dir: "prev" | "next"): void {
    let newMonth = dir === "next" ? currentMonth + 1 : currentMonth - 1;
    let newYear = currentYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    startTransition(async () => {
      const result = await getPrimarAgendeData(newYear, newMonth);
      if (result.success && result.data) {
        setEvents(result.data.events);
        setCurrentYear(newYear);
        setCurrentMonth(newMonth);
        setSelectedDay(null);
        setShowCreateForm(false);
      }
    });
  }

  // --- Event creation ---

  async function handleCreateEvent(formData: FormData): Promise<void> {
    const titlu = formData.get("titlu") as string;
    if (!titlu?.trim()) return;

    setCreateError(null);
    startTransition(async () => {
      const result = await createAgendaEvent({
        titlu: titlu.trim(),
        data_eveniment: formData.get("data_eveniment") as string,
        ora_start: (formData.get("ora_start") as string) || undefined,
        ora_sfarsit: (formData.get("ora_sfarsit") as string) || undefined,
        tip: (formData.get("tip") as AgendaEventRow["tip"]) || "eveniment",
        descriere: (formData.get("descriere") as string) || undefined,
      });
      if (result.error) {
        setCreateError(result.error);
      } else {
        // Re-fetch to get DB-assigned ID
        const fresh = await getPrimarAgendeData(currentYear, currentMonth);
        if (fresh.success && fresh.data) {
          setEvents(fresh.data.events);
        }
        setShowCreateForm(false);
        formRef.current?.reset();
      }
    });
  }

  // --- Event deletion ---

  async function handleDeleteEvent(id: string): Promise<void> {
    setDeleteError(null);
    startTransition(async () => {
      const result = await deleteAgendaEvent(id);
      if (result.error) {
        setDeleteError(result.error);
      } else {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    });
  }

  // --- Calendar grid ---

  const calendarDays = getCalendarDays(currentYear, currentMonth);
  const selectedDayEvents = selectedDay !== null ? getEventsForDay(selectedDay) : [];
  const selectedDateStr =
    selectedDay !== null ? toIsoDate(currentYear, currentMonth, selectedDay) : "";

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 lg:flex-row lg:gap-6">
      {/* Calendar column */}
      <div className="flex flex-col gap-3 lg:flex-1">
        {/* Month navigation header */}
        <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
          <button
            onClick={() => handleMonthChange("prev")}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            aria-label="Luna anterioară"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <h2 className="text-foreground text-sm font-semibold tracking-wide">
            {isPending ? (
              <span className="opacity-50">Se încarcă...</span>
            ) : (
              `${ROMANIAN_MONTHS[currentMonth - 1]} ${currentYear}`
            )}
          </h2>

          <button
            onClick={() => handleMonthChange("next")}
            disabled={isPending}
            className="text-muted-foreground hover:text-foreground flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            aria-label="Luna următoare"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="text-muted-foreground py-1 text-center text-xs font-medium">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="h-16 rounded-md bg-white/[0.01]" />;
            }

            const dayEvents = getEventsForDay(day);
            const today = isToday(currentYear, currentMonth, day);
            const selected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day === selectedDay ? null : day);
                  setShowCreateForm(false);
                  setCreateError(null);
                }}
                className={[
                  "relative flex h-16 flex-col rounded-md border p-1 text-left transition-all",
                  selected
                    ? "border-amber-500/60 bg-amber-500/10"
                    : today
                      ? "border-amber-500/30 bg-white/[0.04] ring-1 ring-amber-500/40"
                      : "border-white/[0.04] bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.05]",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-xs leading-none font-medium",
                    today
                      ? "text-amber-400"
                      : selected
                        ? "text-amber-300"
                        : "text-muted-foreground",
                  ].join(" ")}
                >
                  {day}
                </span>

                {/* Event dots */}
                {dayEvents.length > 0 && (
                  <div className="mt-auto flex flex-wrap gap-0.5 px-0.5 pb-0.5">
                    {dayEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: TIP_COLORS[ev.tip] }}
                        title={ev.titlu}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-muted-foreground text-[9px] leading-none">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail panel */}
      <AnimatePresence>
        {selectedDay !== null && (
          <motion.div
            key="day-panel"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 lg:w-80 xl:w-96"
          >
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <h3 className="text-foreground text-sm font-semibold">
                {selectedDay} {ROMANIAN_MONTHS[currentMonth - 1]} {currentYear}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setCreateError(null);
                  }}
                  disabled={isPending}
                  className="flex items-center gap-1.5 rounded-md bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/30 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Eveniment nou
                </button>
                <button
                  onClick={() => {
                    setSelectedDay(null);
                    setShowCreateForm(false);
                    setCreateError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/[0.06]"
                  aria-label="Închide panoul"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Delete error */}
            {deleteError && (
              <p className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {deleteError}
              </p>
            )}

            {/* Create event form */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  key="create-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <form
                    ref={formRef}
                    action={handleCreateEvent}
                    className="flex flex-col gap-2 rounded-lg border border-white/[0.06] bg-white/[0.04] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs font-medium">
                        Eveniment nou
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setCreateError(null);
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Title */}
                    <input
                      name="titlu"
                      type="text"
                      required
                      placeholder="Titlu eveniment *"
                      className="text-foreground placeholder:text-muted-foreground w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                    />

                    {/* Hidden date pre-filled to selected day */}
                    <input name="data_eveniment" type="hidden" value={selectedDateStr} />

                    {/* Time range */}
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        name="ora_start"
                        type="time"
                        placeholder="Ora start"
                        className="text-foreground rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                      />
                      <input
                        name="ora_sfarsit"
                        type="time"
                        placeholder="Ora sfârsit"
                        className="text-foreground rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                      />
                    </div>

                    {/* Type */}
                    <select
                      name="tip"
                      defaultValue="eveniment"
                      className="text-foreground w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-1.5 text-xs focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                    >
                      {TIP_OPTIONS.map((tip) => (
                        <option key={tip} value={tip}>
                          {TIP_LABELS[tip]}
                        </option>
                      ))}
                    </select>

                    {/* Description */}
                    <textarea
                      name="descriere"
                      rows={2}
                      placeholder="Descriere (opțional)"
                      className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-md border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500/50 focus:outline-none"
                    />

                    {createError && <p className="text-xs text-red-400">{createError}</p>}

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full rounded-md bg-amber-500/20 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/30 disabled:opacity-40"
                    >
                      {isPending ? "Se salvează..." : "Salvează eveniment"}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Events list */}
            <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
                  <div className="text-2xl opacity-30">📅</div>
                  <p className="text-muted-foreground text-xs">Nicio activitate programată</p>
                  <p className="text-muted-foreground/60 text-xs">
                    Apăsați &ldquo;Eveniment nou&rdquo; pentru a adăuga una.
                  </p>
                </div>
              ) : (
                selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex flex-col gap-1.5 rounded-lg border border-white/[0.05] bg-white/[0.03] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        {/* Type badge */}
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${TIP_COLORS[ev.tip]}20`,
                            color: TIP_COLORS[ev.tip],
                          }}
                        >
                          <Tag className="h-2.5 w-2.5" />
                          {TIP_LABELS[ev.tip]}
                        </span>
                        {/* Title */}
                        <p className="text-foreground text-xs leading-snug font-medium">
                          {ev.titlu}
                        </p>
                        {/* Time */}
                        {(ev.ora_start || ev.ora_sfarsit) && (
                          <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
                            <Clock className="h-2.5 w-2.5" />
                            {ev.ora_start ? ev.ora_start.substring(0, 5) : "—"}
                            {ev.ora_sfarsit ? ` – ${ev.ora_sfarsit.substring(0, 5)}` : ""}
                          </p>
                        )}
                        {/* Description */}
                        {ev.descriere && (
                          <p className="text-muted-foreground/80 text-[10px] leading-snug">
                            {ev.descriere}
                          </p>
                        )}
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        disabled={isPending}
                        className="text-muted-foreground flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                        aria-label={`Șterge ${ev.titlu}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
