/**
 * Calendar grid utilities for the Calendar admin page.
 * Pure functions — no side effects, no external dependencies.
 */

/**
 * Returns the Monday-start day offset for the 1st of a month.
 * JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 * Mon-start mapping: Sun→6, Mon→0, Tue→1, Wed→2, Thu→3, Fri→4, Sat→5
 */
export function getMonthOffset(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

/**
 * Builds a calendar grid array for a month using Monday as the first day.
 *
 * @param year - Full year (e.g. 2026)
 * @param month - Zero-indexed month (0=Jan, 11=Dec)
 * @returns Array of 35 or 42 items: null for padding days, number for actual days.
 */
export function buildCalendarGrid(year: number, month: number): (number | null)[] {
  const offset = getMonthOffset(year, month);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];

  // Leading null padding
  for (let i = 0; i < offset; i++) days.push(null);

  // Actual days
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  // Trailing null padding to fill last row
  while (days.length % 7 !== 0) days.push(null);

  return days;
}
