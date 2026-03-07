import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// Types
// ============================================================================

export interface CalEvent {
  id: string;
  title: string;
  date: number; // day of month (1-31)
  month: number; // 0-indexed month
  year: number;
  time: string; // "HH:MM"
  type: string; // "Ședință" | "Deadline" | "Audit" | "Întâlnire" | "Review" | "Training" | "Vizită" | "Evaluare"
  location?: string;
  color: string; // Tailwind class name (e.g. "bg-pink-500 text-white")
}

// ============================================================================
// Event type → Tailwind color class mapping
// ============================================================================

export const EVENT_TYPE_COLORS: Record<string, string> = {
  Ședință: "bg-pink-500 text-white",
  Deadline: "bg-red-500 text-white",
  Audit: "bg-amber-500 text-black",
  Întâlnire: "bg-sky-500 text-white",
  Review: "bg-violet-500 text-white",
  Training: "bg-emerald-500 text-white",
  Vizită: "bg-cyan-500 text-white",
  Evaluare: "bg-orange-500 text-white",
};

// ============================================================================
// Seed events from Figma reference (March 2026)
// Hex colors replaced with Tailwind class names:
//   #ec4899 → "bg-pink-500 text-white"   (Ședință)
//   #ef4444 → "bg-red-500 text-white"    (Deadline)
//   #f59e0b → "bg-amber-500 text-black"  (Audit / Evaluare)
//   #3b82f6 → "bg-sky-500 text-white"    (Întâlnire)
//   #8b5cf6 → "bg-violet-500 text-white" (Review)
//   #10b981 → "bg-emerald-500 text-white"(Training)
//   #06b6d4 → "bg-cyan-500 text-white"   (Vizită)
// ============================================================================

const SEED_EVENTS: CalEvent[] = [
  {
    id: "e1",
    title: "Ședință Consiliu Local",
    date: 4,
    month: 2,
    year: 2026,
    time: "10:00",
    type: "Ședință",
    location: "Sala Mare",
    color: "bg-pink-500 text-white",
  },
  {
    id: "e2",
    title: "Deadline cerere #1839",
    date: 5,
    month: 2,
    year: 2026,
    time: "17:00",
    type: "Deadline",
    color: "bg-red-500 text-white",
  },
  {
    id: "e3",
    title: "Audit documente Q1",
    date: 7,
    month: 2,
    year: 2026,
    time: "09:00",
    type: "Audit",
    location: "Biroul 3",
    color: "bg-amber-500 text-black",
  },
  {
    id: "e4",
    title: "Întâlnire contribuabili",
    date: 10,
    month: 2,
    year: 2026,
    time: "14:00",
    type: "Întâlnire",
    location: "Sala Conferințe",
    color: "bg-sky-500 text-white",
  },
  {
    id: "e5",
    title: "Review buget lunar",
    date: 12,
    month: 2,
    year: 2026,
    time: "11:00",
    type: "Review",
    color: "bg-violet-500 text-white",
  },
  {
    id: "e6",
    title: "Training funcționari noi",
    date: 14,
    month: 2,
    year: 2026,
    time: "09:30",
    type: "Training",
    location: "Sala IT",
    color: "bg-emerald-500 text-white",
  },
  {
    id: "e7",
    title: "Vizită teren str. Aviatorilor",
    date: 18,
    month: 2,
    year: 2026,
    time: "08:00",
    type: "Vizită",
    color: "bg-cyan-500 text-white",
  },
  {
    id: "e8",
    title: "Ședință buget Q2",
    date: 21,
    month: 2,
    year: 2026,
    time: "10:00",
    type: "Ședință",
    location: "Sala Mare",
    color: "bg-pink-500 text-white",
  },
  {
    id: "e9",
    title: "Evaluare personal",
    date: 25,
    month: 2,
    year: 2026,
    time: "14:00",
    type: "Evaluare",
    color: "bg-orange-500 text-white",
  },
  {
    id: "e10",
    title: "Deadline raport lunar",
    date: 28,
    month: 2,
    year: 2026,
    time: "23:59",
    type: "Deadline",
    color: "bg-red-500 text-white",
  },
];

// ============================================================================
// Store interface
// ============================================================================

interface CalendarEventsState {
  events: CalEvent[];
  addEvent: (event: Omit<CalEvent, "id">) => void;
  deleteEvent: (id: string) => void;
}

// ============================================================================
// Store
// ============================================================================

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Date.now().toString();
  }
}

export const useCalendarEventsStore = create<CalendarEventsState>()(
  persist(
    (set) => ({
      events: SEED_EVENTS,
      addEvent: (event: Omit<CalEvent, "id">): void => {
        set((state) => ({
          events: [...state.events, { ...event, id: generateId() }],
        }));
      },
      deleteEvent: (id: string): void => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
      },
    }),
    {
      name: "calendar-events",
    }
  )
);
