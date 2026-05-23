/** Fecha absoluta para posts antiguos (es-ES). */
export function formatPostAbsolute(iso: string): string {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/** Texto corto tipo feed web («hace 2 h», «ahora»). */
export function formatPostRelative(iso: string, now = new Date()): string {
  let d: Date;
  try {
    d = new Date(iso);
    if (Number.isNaN(d.getTime())) return formatPostAbsolute(iso);
  } catch {
    return formatPostAbsolute(iso);
  }

  let diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) diffMs = 0;

  const sec = Math.floor(diffMs / 1000);
  if (sec < 45) return "ahora";

  const min = Math.floor(sec / 60);
  if (min < 60) return min <= 1 ? "hace 1 min" : `hace ${min} min`;

  const h = Math.floor(min / 60);
  if (h < 24) return h === 1 ? "hace 1 h" : `hace ${h} h`;

  const days = Math.floor(h / 24);
  if (days < 7) return days === 1 ? "hace 1 día" : `hace ${days} días`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return weeks === 1 ? "hace 1 semana" : `hace ${weeks} semanas`;

  return formatPostAbsolute(iso);
}

/** Clave local `YYYY-MM-DD` para agrupar publicaciones por día en el feed. */
export function feedDayKey(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

/** Etiqueta para separadores del timeline: «Hoy», «Ayer», o fecha legible en español. */
export function formatFeedDayLabel(iso: string, now = new Date()): string {
  let post: Date;
  try {
    post = new Date(iso);
    if (Number.isNaN(post.getTime())) return "";
  } catch {
    return "";
  }

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const postDay = new Date(post);
  postDay.setHours(0, 0, 0, 0);

  if (postDay.getTime() === today.getTime()) return "Hoy";
  if (postDay.getTime() === yesterday.getTime()) return "Ayer";

  const sameYear = postDay.getFullYear() === today.getFullYear();
  if (sameYear) {
    const raw = new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(postDay);
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "long" }).format(postDay);
}
