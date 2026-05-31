export function formatRelativeMinutes(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 45_000) return "Actualizado ahora";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `Actualizado hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Actualizado hace ${h} h`;
  return "Actualizado hace más de un día";
}
