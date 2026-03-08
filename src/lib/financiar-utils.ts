/**
 * Financial aggregation utilities for the Financiar admin page.
 * Pure functions — no side effects, no external dependencies.
 */

// ============================================================================
// Interfaces
// ============================================================================

export interface PlatiRow {
  suma: number;
  status: string;
  metoda_plata: string | null;
  created_at: string;
}

export interface MonthlyRevenue {
  month: string;
  colectat: number;
  target: number;
}

/** Extended monthly revenue with failed payment breakdown for AreaChart */
export interface MonthlyRevenueExtended {
  month: string;
  colectat: number;
  esuat: number;
}

export interface DailyVolume {
  day: string;
  volume: number;
}

export interface MetodaBreakdown {
  card: number;
  transfer: number;
  numerar: number;
}

// ============================================================================
// Constants
// ============================================================================

/** Romanian month abbreviations (0=Ian, 11=Dec) */
const ROMANIAN_MONTHS: readonly string[] = [
  "Ian",
  "Feb",
  "Mar",
  "Apr",
  "Mai",
  "Iun",
  "Iul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Romanian day abbreviations, Monday-first (0=Lun, 6=Dum) */
const ROMANIAN_DAYS: readonly string[] = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sam", "Dum"];

/** Target multiplier: 8% above collected */
const TARGET_MULTIPLIER = 1.08;

// ============================================================================
// Helpers
// ============================================================================

/**
 * Maps a JS getDay() value (0=Sun) to Monday-start index (0=Mon, 6=Sun).
 */
function jsDayToMonStart(jsDay: number): number {
  return jsDay === 0 ? 6 : jsDay - 1;
}

// ============================================================================
// Exported functions
// ============================================================================

/**
 * Aggregates successful payments by calendar month.
 *
 * @param plati - Array of payment rows
 * @returns Array of monthly revenue entries (only months with success payments included).
 *          Ordered by calendar month ascending.
 */
export function aggregateByMonth(plati: PlatiRow[]): MonthlyRevenue[] {
  const successPayments = plati.filter((p) => p.status === "success");
  if (successPayments.length === 0) return [];

  // Key: "YYYY-MM"
  const byMonth = new Map<string, number>();

  for (const p of successPayments) {
    const date = new Date(p.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    byMonth.set(key, (byMonth.get(key) ?? 0) + p.suma);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, colectat]) => {
      const parts = key.split("-");
      const monthIndex = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;
      return {
        month: ROMANIAN_MONTHS[monthIndex] ?? key,
        colectat,
        target: colectat * TARGET_MULTIPLIER,
      };
    });
}

/**
 * Aggregates payments by calendar month with colectat (success) and esuat (failed) breakdowns.
 * Used by the Financiar AreaChart that shows colectat vs esuat over time.
 *
 * @param plati - Array of payment rows
 * @returns Array of monthly entries ordered by calendar month ascending.
 *          Months with any payment activity (success or failed) are included.
 */
export function aggregateByMonthFull(plati: PlatiRow[]): MonthlyRevenueExtended[] {
  const relevantPayments = plati.filter((p) => p.status === "success" || p.status === "failed");
  if (relevantPayments.length === 0) return [];

  // Key: "YYYY-MM"
  const byMonth = new Map<string, { colectat: number; esuat: number }>();

  for (const p of relevantPayments) {
    const date = new Date(p.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}`;
    const existing = byMonth.get(key) ?? { colectat: 0, esuat: 0 };
    if (p.status === "success") {
      existing.colectat += p.suma;
    } else {
      existing.esuat += p.suma;
    }
    byMonth.set(key, existing);
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { colectat, esuat }]) => {
      const parts = key.split("-");
      const monthIndex = parts[1] !== undefined ? parseInt(parts[1], 10) : 0;
      return {
        month: ROMANIAN_MONTHS[monthIndex] ?? key,
        colectat,
        esuat,
      };
    });
}

/**
 * Groups successful payments by day of the week (Monday-first).
 *
 * @param plati - Array of payment rows
 * @returns Array of 7 DailyVolume entries (Lun through Dum).
 */
export function groupByDayOfWeek(plati: PlatiRow[]): DailyVolume[] {
  const counts = Array.from(
    { length: 7 },
    (_, i): DailyVolume => ({
      day: ROMANIAN_DAYS[i] ?? `Day${i}`,
      volume: 0,
    })
  );

  for (const p of plati) {
    if (p.status !== "success") continue;
    const jsDay = new Date(p.created_at).getDay();
    const idx = jsDayToMonStart(jsDay);
    const dayEntry = counts[idx];
    if (dayEntry) dayEntry.volume += 1;
  }

  return counts;
}

/**
 * Groups successful payments by payment method.
 *
 * @param plati - Array of payment rows
 * @returns Count of success payments per method (card, transfer, numerar).
 */
export function groupByMetoda(plati: PlatiRow[]): MetodaBreakdown {
  const result: MetodaBreakdown = { card: 0, transfer: 0, numerar: 0 };

  for (const p of plati) {
    if (p.status !== "success") continue;
    if (p.metoda_plata === "card") result.card += 1;
    else if (p.metoda_plata === "transfer") result.transfer += 1;
    else if (p.metoda_plata === "numerar") result.numerar += 1;
  }

  return result;
}
