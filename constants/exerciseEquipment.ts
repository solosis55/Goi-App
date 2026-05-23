/** Slugs alineados con Goi Web (`src/data/exerciseEquipmentFilters.ts`). */
export const CATALOG_EQUIPMENT_OPTIONS = [
  { slug: "maquina", label: "Máquina" },
  { slug: "maquina_palanca", label: "Palanca" },
  { slug: "cable", label: "Cable" },
  { slug: "peso_libre", label: "Mancuernas" },
  { slug: "bandas", label: "Bandas" },
  { slug: "barra", label: "Barra" },
] as const;

export function equipmentLabel(slug: string | undefined): string {
  if (!slug) return "";
  return CATALOG_EQUIPMENT_OPTIONS.find((o) => o.slug === slug)?.label ?? slug;
}
