/** Extrait un nombre de minutes depuis "15 min", "1 h", "1h30", etc. */
export function parseMinutes(value: string): number | null {
  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  const hourMin = raw.match(/(\d+)\s*h(?:\s*(\d+))?/);
  if (hourMin) {
    const h = Number(hourMin[1]) || 0;
    const m = Number(hourMin[2]) || 0;
    return h * 60 + m;
  }

  const mins = raw.match(/(\d+(?:[.,]\d+)?)\s*(?:min|minutes?)?/);
  if (mins) {
    return Math.round(Number(mins[1].replace(",", ".")));
  }

  return null;
}
