/** Helpers de dates calendaires en fuseau Europe/Paris. */

export const PARIS_TZ = "Europe/Paris";

/** Index 0 = dimanche, comme `Date#getUTCDay()`. */
const WEEKDAYS_LONG_FR = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
] as const;

const WEEKDAYS_SHORT_FR = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"] as const;

const MONTHS_LONG_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
] as const;

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
  const d = parisCalendarDate(now);
  const formatted = `${WEEKDAYS_LONG_FR[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_LONG_FR[d.getUTCMonth()]}`;
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/** Abréviation FR du jour (Lun, Mar, …) pour une date calendaire UTC midi. */
export function formatDayShortFr(date: Date): string {
  const raw = WEEKDAYS_SHORT_FR[date.getUTCDay()];
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

/** Ex. « Jeu. 28 août » — puce planning / liste de courses. */
export function formatWeekdayDayMonthFr(date: Date): string {
  return `${formatDayShortFr(date)}. ${date.getUTCDate()} ${MONTHS_LONG_FR[date.getUTCMonth()]}`;
}

/** Ex. « 28/08 » — seuil DLC compact. */
export function formatDayMonthNumericFr(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

/** En-têtes de grille, semaine lundi → dimanche. */
export const WEEKDAY_LETTERS_FR = ["L", "M", "M", "J", "V", "S", "D"] as const;

export function formatMonthYearFr(date: Date): string {
  const name = MONTHS_LONG_FR[date.getUTCMonth()];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${date.getUTCFullYear()}`;
}

export function formatDayLongFr(date: Date): string {
  return `${WEEKDAYS_LONG_FR[date.getUTCDay()]} ${date.getUTCDate()} ${MONTHS_LONG_FR[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12, 0, 0));
}

/** Décale une date calendaire Paris d’un nombre de mois (clamp le jour de fin de mois). */
export function addMonths(date: Date, months: number): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + months;
  const day = date.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0, 12, 0, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay), 12, 0, 0));
}

export type CalendarCell = {
  iso: string;
  day: number;
  inMonth: boolean;
};

/** Cases d’un mois, y compris les jours des semaines chevauchantes (lun–dim). */
export function buildMonthCells(year: number, monthIndex: number): CalendarCell[] {
  const first = new Date(Date.UTC(year, monthIndex, 1, 12, 0, 0));
  const start = startOfWeek(first);
  const last = new Date(Date.UTC(year, monthIndex + 1, 0, 12, 0, 0));
  const end = addDays(startOfWeek(last), 6);
  const cells: CalendarCell[] = [];
  for (let cursor = start; cursor.getTime() <= end.getTime(); cursor = addDays(cursor, 1)) {
    cells.push({
      iso: isoDateFromCalendar(cursor),
      day: cursor.getUTCDate(),
      inMonth: cursor.getUTCMonth() === monthIndex,
    });
  }
  return cells;
}
