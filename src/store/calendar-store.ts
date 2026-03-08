import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// Types
// ============================================================================

export interface CalEvent {
  id: string;
  title: string;
  date: string; // ISO date string "YYYY-MM-DD"
  time: string; // "HH:MM"
  color: string; // Tailwind class string: "bg-pink-500", "bg-red-500" etc.
  type: string; // event type label
  location?: string;
  recurrence?: "none" | "zilnic" | "saptamanal" | "lunar"; // recurring event rule
}

interface CalendarStore {
  events: CalEvent[];
  addEvent: (event: Omit<CalEvent, "id">) => void;
  removeEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<Omit<CalEvent, "id">>) => void;
}

// ============================================================================
// ID generation
// ============================================================================

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

// ============================================================================
// Seed events — Figma reference (March 2026) with Tailwind class colors
// ============================================================================

const SEED_EVENTS: CalEvent[] = [
  {
    id: "e1",
    title: "Ședință Consiliu Local",
    date: "2026-03-04",
    time: "10:00",
    color: "bg-pink-500",
    type: "Ședință",
    location: "Sala Mare",
  },
  {
    id: "e2",
    title: "Deadline cerere #1839",
    date: "2026-03-05",
    time: "17:00",
    color: "bg-red-500",
    type: "Deadline",
  },
  {
    id: "e3",
    title: "Audit documente Q1",
    date: "2026-03-07",
    time: "09:00",
    color: "bg-amber-500",
    type: "Audit",
    location: "Biroul 3",
  },
  {
    id: "e4",
    title: "Întâlnire contribuabili",
    date: "2026-03-10",
    time: "14:00",
    color: "bg-blue-500",
    type: "Întâlnire",
    location: "Sala Conferințe",
  },
  {
    id: "e5",
    title: "Review buget lunar",
    date: "2026-03-12",
    time: "11:00",
    color: "bg-violet-500",
    type: "Review",
  },
  {
    id: "e6",
    title: "Training funcționari noi",
    date: "2026-03-14",
    time: "09:30",
    color: "bg-emerald-500",
    type: "Training",
    location: "Sala IT",
  },
];

// ============================================================================
// Store
// ============================================================================

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set) => ({
      events: SEED_EVENTS,
      addEvent: (event: Omit<CalEvent, "id">): void => {
        set((state) => ({
          events: [...state.events, { ...event, id: generateId() }],
        }));
      },
      removeEvent: (id: string): void => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },
      updateEvent: (id: string, updates: Partial<Omit<CalEvent, "id">>): void => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        }));
      },
    }),
    {
      name: "primariata-calendar-events",
    }
  )
);
