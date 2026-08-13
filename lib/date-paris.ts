/** Helpers de dates calendaires en fuseau Europe/Paris. */

export const PARIS_TZ = "Europe/Paris";

/**
 * Jour calendaire à Paris, représenté en UTC à midi.
 * Évite les décalages DST lors des additions de jours.
 */
export function parisCalendarDate(now: Date = new Date()): Date {
  const iso = now.toLocaleDateString("en-CA", { timeZone: PARIS_TZ }); // YYYY-MM-DD
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

/** Lundi de la semaine (Lun–Dim) contenant `date`, en calendrier Paris. */
export function startOfWeek(date: Date = parisCalendarDate()): Date {
  const d = parisCalendarDate(date);
  const day = d.getUTCDay(); // 0 = dimanche … 6 = samedi
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(d, diff);
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function dayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
}

/** YYYY-MM-DD à partir d’une date calendaire Paris (UTC midi). */
export function isoDateFromCalendar(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Date calendaire Paris (UTC midi) depuis YYYY-MM-DD. */
export function calendarDateFromIso(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
}

/** Index 0 = lundi … 6 = dimanche. */
export function mondayBasedIndex(date: Date): number {
  const day = date.getUTCDay();
  return day === 0 ? 6 : day - 1;
}

export function formatWeekLabel(
  weekStart: Date,
  months: readonly string[],
): string {
  const weekEnd = addDays(weekStart, 6);
  const startDay = weekStart.getUTCDate();
  const endDay = weekEnd.getUTCDate();
  const startMonth = months[weekStart.getUTCMonth()];
  const endMonth = months[weekEnd.getUTCMonth()];

  if (weekStart.getUTCMonth() === weekEnd.getUTCMonth()) {
    return `Semaine du ${startDay} au ${endDay} ${endMonth}`;
  }
  return `Semaine du ${startDay} ${startMonth} au ${endDay} ${endMonth}`;
}

export function formatTodayLongFr(now: Date = new Date()): string {
  const formatted = now.toLocaleDateString("fr-FR", {
    timeZone: PARIS_TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
