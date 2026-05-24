/** Evita que Android reutilice un drawable corrupto tras mostrar la misma URI en otro tamaño. */
export function withMediaCacheBuster(url: string, token: number): string {
  const u = url.trim();
  if (!u || token === 0) return u;

  try {
    const parsed = new URL(u);
    parsed.searchParams.set("_cb", String(token));
    return parsed.toString();
  } catch {
    const sep = u.includes("?") ? "&" : "?";
    return `${u}${sep}_cb=${token}`;
  }
}
