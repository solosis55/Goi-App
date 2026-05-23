/** Formato legible para historial (es-ES). */
export function formatSessionPerformedAt(iso: string): string {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(ms));
}

/** Valores por defecto para inputs de fecha/hora locales. */
export function defaultSessionDateParts(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${d}`, time: `${h}:${min}` };
}

/** Convierte `YYYY-MM-DD` + `HH:mm` a ISO UTC (hora local del dispositivo). */
export function localDateTimeToIso(date: string, time: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const tmatch = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match || !tmatch) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const hour = Number(tmatch[1]);
  const minute = Number(tmatch[2]);
  const dt = new Date(year, month, day, hour, minute, 0, 0);
  if (!Number.isFinite(dt.getTime())) return null;
  return dt.toISOString();
}
