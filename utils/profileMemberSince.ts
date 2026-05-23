/** «marzo de 2024» para «En GoI desde…». */
export function formatMemberSince(iso: string | undefined): string {
  if (!iso?.trim()) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const raw = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(d);
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  } catch {
    return "";
  }
}
