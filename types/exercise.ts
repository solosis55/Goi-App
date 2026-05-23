/** Movimiento del catálogo (variantes de material y ejecución en el editor de rutina). */
export type Exercise = {
  id: string;
  name: string;
  muscles?: string[];
  /** Slugs de material con los que se puede hacer el movimiento (barra, mancuernas, máquina…). */
  equipmentTags?: string[];
  /** Material preseleccionado al añadir; debe estar en `equipmentTags`. */
  defaultEquipmentSlug?: string;
  equipment?: string;
  description?: string;
  instructions?: string;
  /** Imagen del ejercicio (catálogo); opcional hasta que el backend la sirva. */
  imageUrl?: string;
};
