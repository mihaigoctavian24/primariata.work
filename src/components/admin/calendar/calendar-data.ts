// ─── Types ────────────────────────────────────────────

export interface CalEvent {
  id: string;
  title: string;
  date: number; // day of month
  time: string;
  color: string;
  type: string;
  location?: string;
}

// ─── Mock Data ────────────────────────────────────────

export const events: CalEvent[] = [
  {
    id: "e1",
    title: "Ședință Consiliu Local",
    date: 4,
    time: "10:00",
    color: "#ec4899",
    type: "Ședință",
    location: "Sala Mare",
  },
  {
    id: "e2",
    title: "Deadline cerere #1839",
    date: 5,
    time: "17:00",
    color: "#ef4444",
    type: "Deadline",
  },
  {
    id: "e3",
    title: "Audit documente Q1",
    date: 7,
    time: "09:00",
    color: "#f59e0b",
    type: "Audit",
    location: "Biroul 3",
  },
  {
    id: "e4",
    title: "Întâlnire contribuabili",
    date: 10,
    time: "14:00",
    color: "#3b82f6",
    type: "Întâlnire",
    location: "Sala Conferințe",
  },
  {
    id: "e5",
    title: "Review buget lunar",
    date: 12,
    time: "11:00",
    color: "#8b5cf6",
    type: "Review",
  },
  {
    id: "e6",
    title: "Training funcționari noi",
    date: 14,
    time: "09:30",
    color: "#10b981",
    type: "Training",
    location: "Sala IT",
  },
  {
    id: "e7",
    title: "Vizită teren str. Aviatorilor",
    date: 18,
    time: "08:00",
    color: "#06b6d4",
    type: "Vizită",
  },
  {
    id: "e8",
    title: "Ședință buget Q2",
    date: 21,
    time: "10:00",
    color: "#ec4899",
    type: "Ședință",
    location: "Sala Mare",
  },
  {
    id: "e9",
    title: "Evaluare personal",
    date: 25,
    time: "14:00",
    color: "#f59e0b",
    type: "Evaluare",
  },
  {
    id: "e10",
    title: "Deadline raport lunar",
    date: 28,
    time: "23:59",
    color: "#ef4444",
    type: "Deadline",
  },
];

export const daysOfWeek = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];

export const TODAY = 4;
export const DAYS_IN_MONTH = 31;
export const FIRST_DAY_OFFSET = 6; // March 1, 2026 is Sunday → offset 6 in Mon-start week
