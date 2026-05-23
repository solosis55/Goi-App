export function formatProfileStatCount(n: number | null): string {
  if (n === null) return "…";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  return String(n);
}
