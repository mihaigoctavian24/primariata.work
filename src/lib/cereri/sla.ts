import { differenceInCalendarDays } from "date-fns";
import { CerereStatus } from "@/lib/validations/cereri";

/**
 * SLA status indicator for cereri.
 * - green: >5 days remaining
 * - yellow: 1-5 days remaining
 * - red: <=0 days remaining (overdue)
 * - paused: cerere is in info_suplimentare (SLA timer paused)
 * - none: no deadline set (data_termen is null)
 */
export type SlaStatus = "green" | "yellow" | "red" | "paused" | "none";

/**
 * SLA information for a cerere.
 */
export interface SlaInfo {
  status: SlaStatus;
  daysRemaining: number | null;
  deadline: Date | null;
  isPaused: boolean;
}

/**
 * Calculate SLA status for a cerere based on its deadline and current status.
 *
 * The SLA timer pauses when cerere enters info_suplimentare.
 * The data_termen is already adjusted by the DB trigger when resuming,
 * so the totalPausedDays parameter is informational only here.
 *
 * @param dataTermen - The deadline date string (ISO format) or null
 * @param cerereStatus - The current cerere status
 * @param totalPausedDays - Total accumulated paused days (informational)
 * @returns SLA information with status, days remaining, and deadline
 */
export function calculateSla(
  dataTermen: string | null,
  cerereStatus: string,
  totalPausedDays: number = 0
): SlaInfo {
  // No deadline set
  if (!dataTermen) {
    return { status: "none", daysRemaining: null, deadline: null, isPaused: false };
  }

  const deadline = new Date(dataTermen);

  // SLA is paused when cerere is in info_suplimentare
  const isPaused = cerereStatus === CerereStatus.INFO_SUPLIMENTARE;
  if (isPaused) {
    return { status: "paused", daysRemaining: null, deadline, isPaused: true };
  }

  // Calculate days remaining from now to deadline
  // Note: data_termen is already extended by the DB trigger after pause/resume,
  // so we compare directly against the stored deadline
  const now = new Date();
  const daysRemaining = differenceInCalendarDays(deadline, now);

  let status: SlaStatus;
  if (daysRemaining <= 0) {
    status = "red";
  } else if (daysRemaining <= 5) {
    status = "yellow";
  } else {
    status = "green";
  }

  // Suppress unused variable warning -- totalPausedDays is kept for API completeness
  void totalPausedDays;

  return { status, daysRemaining, deadline, isPaused: false };
}
