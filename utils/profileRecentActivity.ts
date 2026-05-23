import { formatPostRelative } from "./feedPostDate";

function formatSessionRelative(iso: string, now = new Date()): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const diffMs = now.getTime() - t;
  if (diffMs < 0) return "hoy";
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(t));
}

/** Línea compacta de actividad reciente para perfiles públicos. */
export function buildProfileActivityLine(
  lastPostCreatedAt: string | undefined,
  lastSessionPerformedAt: string | undefined
): string | null {
  const parts: string[] = [];
  if (lastPostCreatedAt) {
    parts.push(`Publicó ${formatPostRelative(lastPostCreatedAt)}`);
  }
  if (lastSessionPerformedAt) {
    const rel = formatSessionRelative(lastSessionPerformedAt);
    if (rel) parts.push(`Entrenó ${rel}`);
  }
  if (parts.length === 0) return null;
  return parts.join(" · ");
}
