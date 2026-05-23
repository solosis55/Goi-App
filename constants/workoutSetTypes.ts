export type WorkoutSetTypeMode = "reps" | "time";

export type WorkoutSetTypeSlug =
  | "normal"
  | "calentamiento"
  | "fallo"
  | "dropset"
  | "rest_pause"
  | "amrap"
  | "tempo";

export type WorkoutSetTypeOption = {
  slug: WorkoutSetTypeSlug;
  label: string;
  description: string;
  mode: WorkoutSetTypeMode;
};

export const WORKOUT_SET_TYPE_OPTIONS: readonly WorkoutSetTypeOption[] = [
  {
    slug: "normal",
    label: "Normal",
    description: "Serie estándar con repeticiones y peso objetivo.",
    mode: "reps",
  },
  {
    slug: "calentamiento",
    label: "Calentamiento",
    description: "Carga ligera para activar el músculo y afinar la técnica.",
    mode: "reps",
  },
  {
    slug: "fallo",
    label: "Al fallo",
    description: "Hasta no poder hacer otra repetición con buena forma.",
    mode: "reps",
  },
  {
    slug: "dropset",
    label: "Dropset",
    description: "Bajadas de peso encadenadas dentro de la misma serie.",
    mode: "reps",
  },
  {
    slug: "rest_pause",
    label: "Rest-pause",
    description: "Pausas breves y más repeticiones con el mismo peso.",
    mode: "reps",
  },
  {
    slug: "amrap",
    label: "AMRAP",
    description: "Tantas repeticiones como puedas en el tiempo indicado.",
    mode: "time",
  },
  {
    slug: "tempo",
    label: "Tempo",
    description: "Trabajo guiado por duración o tempo de ejecución.",
    mode: "time",
  },
];

export const WORKOUT_SET_TYPE_PICKER_SECTIONS = [
  {
    mode: "reps" as const,
    title: "Por repeticiones",
    subtitle: "Reps, kilos y técnicas de intensidad.",
  },
  {
    mode: "time" as const,
    title: "Por tiempo",
    subtitle: "Cronómetro de trabajo y límite temporal.",
  },
] as const;

export function workoutSetTypesForMode(mode: WorkoutSetTypeMode): WorkoutSetTypeOption[] {
  return WORKOUT_SET_TYPE_OPTIONS.filter((o) => o.mode === mode);
}

export function workoutSetTypeLabel(slug: string): string {
  return WORKOUT_SET_TYPE_OPTIONS.find((o) => o.slug === slug)?.label ?? "Normal";
}

/** Símbolo compacto para el botón de tipo en filas de series. */
const SET_TYPE_ICONS: Record<WorkoutSetTypeSlug, string> = {
  normal: "N",
  calentamiento: "W",
  fallo: "F",
  dropset: "↓",
  amrap: "AMRAP",
  tempo: "T",
  rest_pause: "R.P",
};

export function workoutSetTypeIcon(slug: string): string {
  const key = slug as WorkoutSetTypeSlug;
  return SET_TYPE_ICONS[key] ?? SET_TYPE_ICONS.normal;
}

/** Apariencia compacta de la columna «Tipo» durante el entrenamiento (sin caja ni subtítulo). */
export type WorkoutSetTypePerformStyle = {
  glyph: string;
  color: string;
  fontSize: number;
  fontWeight: "700" | "800" | "900";
  letterSpacing?: number;
  /** Opacidad base del glifo (p. ej. serie normal más discreta). */
  opacity?: number;
};

const PERFORM_COLUMN_STYLES: Record<WorkoutSetTypeSlug, WorkoutSetTypePerformStyle> = {
  normal: {
    glyph: "N",
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.45,
  },
  calentamiento: {
    glyph: "W",
    color: "#fbbf24",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  fallo: {
    glyph: "F",
    color: "#f87171",
    fontSize: 15,
    fontWeight: "800",
  },
  dropset: {
    glyph: "↓",
    color: "#a78bfa",
    fontSize: 18,
    fontWeight: "800",
  },
  amrap: {
    glyph: "∞",
    color: "#34d399",
    fontSize: 17,
    fontWeight: "800",
  },
  tempo: {
    glyph: "T",
    color: "#22d3ee",
    fontSize: 15,
    fontWeight: "800",
  },
  rest_pause: {
    glyph: "R·P",
    color: "#c084fc",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: -0.6,
  },
};

export function workoutSetTypePerformStyle(slug: string): WorkoutSetTypePerformStyle {
  const key = slug as WorkoutSetTypeSlug;
  return PERFORM_COLUMN_STYLES[key] ?? PERFORM_COLUMN_STYLES.normal;
}
