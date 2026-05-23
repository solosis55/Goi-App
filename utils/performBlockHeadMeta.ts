import { equipmentLabel } from "../constants/exerciseEquipment";

type BlockMeta = {
  laterality?: "bilateral" | "unilateral";
  equipmentSlug?: string;
};

/** Línea bajo el nombre en entrenar: «2/4 series · Bilateral · Mancuernas». */
export function performBlockHeadMetaLine(block: BlockMeta, doneCount: number, totalSets: number): string {
  const lat = (block.laterality ?? "bilateral") === "unilateral" ? "Unilateral" : "Bilateral";
  const eq = equipmentLabel(block.equipmentSlug);
  const base = `${doneCount}/${totalSets} series · ${lat}`;
  return eq ? `${base} · ${eq}` : base;
}

export function performBlockSetsDoneRatio(doneCount: number, totalSets: number): number {
  if (totalSets <= 0) return 0;
  return doneCount / totalSets;
}
