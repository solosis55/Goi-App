import type { PerformSetSubStep, SessionPerformSet } from "../types/workoutSessionPerform";
import type { WorkoutSetTypeSlug } from "../constants/workoutSetTypes";

export const PERFORM_SUB_STEPS_MAX = 12;
/** Solo subseries adicionales; la 1.ª va en la fila principal (reps/kg). */
export const PERFORM_SUB_STEPS_MIN = 0;

const STANDARD_TYPES: WorkoutSetTypeSlug[] = ["normal", "calentamiento", "fallo"];
const TIMED_TYPES: WorkoutSetTypeSlug[] = ["amrap", "tempo"];
const SUB_STEP_TYPES: WorkoutSetTypeSlug[] = ["dropset", "rest_pause"];

export function isStandardPerformSetType(slug: string): boolean {
  return (STANDARD_TYPES as string[]).includes(slug);
}

export function isTimedPerformSetType(slug: string): boolean {
  return (TIMED_TYPES as string[]).includes(slug);
}

export function isSubStepPerformSetType(slug: string): boolean {
  return (SUB_STEP_TYPES as string[]).includes(slug);
}

export function createEmptySubStep(): PerformSetSubStep {
  return { weight: "", reps: "" };
}

function trimField(value: string | undefined, max = 24): string {
  return (value ?? "").slice(0, max);
}

function normalizeSubStep(step: PerformSetSubStep): PerformSetSubStep {
  return {
    weight: trimField(step.weight),
    reps: trimField(step.reps),
  };
}

/** Migra formato antiguo (1.ª bajada duplicada en subSteps) sin borrar extras nuevas. */
function normalizeExtraSubSteps(row: SessionPerformSet): PerformSetSubStep[] {
  const raw = (row.subSteps ?? []).map(normalizeSubStep);
  if (raw.length === 0) return [];

  const mainW = trimField(row.actualWeight);
  const mainR = trimField(row.actualReps);
  const first = raw[0]!;
  const duplicatesMain = first.weight === mainW && first.reps === mainR;

  if (!duplicatesMain) {
    return raw.slice(0, PERFORM_SUB_STEPS_MAX);
  }

  // Varias entradas: la primera solía ser copia de la fila principal (formato antiguo).
  if (raw.length >= 2) {
    return raw.slice(1).slice(0, PERFORM_SUB_STEPS_MAX);
  }

  // Una sola entrada igual a la principal: solo quitar si la principal tiene datos (legado).
  if (mainW || mainR) {
    return [];
  }

  // Principal vacía + un extra vacío = bajada recién añadada con «+ Bajada».
  return raw;
}

function defaultMiniRestSec(): string {
  return "15";
}

/** Asegura campos coherentes con el tipo de serie (sesiones guardadas en AsyncStorage). */
export function normalizePerformSet(row: SessionPerformSet): SessionPerformSet {
  const slug = row.planned.setType || "normal";
  const base: SessionPerformSet = {
    ...row,
    planned: { ...row.planned, setType: slug },
    actualReps: trimField(row.actualReps),
    actualWeight: trimField(row.actualWeight),
    rpe: trimField(row.rpe),
  };

  if (isStandardPerformSetType(slug)) {
    const { subSteps: _s, workDurationSec: _w, miniRestSec: _m, ...rest } = base;
    return rest;
  }

  if (isTimedPerformSetType(slug)) {
    const { subSteps: _s, miniRestSec: _m, ...rest } = base;
    return {
      ...rest,
      workDurationSec: trimField(row.workDurationSec),
    };
  }

  if (slug === "dropset") {
    const steps = normalizeExtraSubSteps(row);
    return {
      ...base,
      subSteps: steps,
    };
  }

  if (slug === "rest_pause") {
    const steps = normalizeExtraSubSteps(row);
    return {
      ...base,
      miniRestSec: trimField(row.miniRestSec || defaultMiniRestSec()),
      subSteps: steps,
    };
  }

  return base;
}

/** Campos extra al cambiar el tipo en el selector. */
export function migratePerformSetForType(
  row: SessionPerformSet,
  nextType: string
): Partial<SessionPerformSet> {
  const normalized = normalizePerformSet({
    ...row,
    planned: { ...row.planned, setType: nextType },
    subSteps: undefined,
    workDurationSec: undefined,
    miniRestSec: undefined,
  });
  return {
    subSteps: normalized.subSteps,
    workDurationSec: normalized.workDurationSec,
    miniRestSec: normalized.miniRestSec,
  };
}

export function clonePerformSet(from: SessionPerformSet): SessionPerformSet {
  return normalizePerformSet({
    ...from,
    planned: { ...from.planned },
    done: false,
    subSteps: from.subSteps?.map((s) => ({ ...s })),
  });
}

export function formatPerformSetSummary(row: SessionPerformSet): string | null {
  const slug = row.planned.setType;
  if (slug === "dropset") {
    const main =
      row.actualWeight.trim() || row.actualReps.trim()
        ? `1 ${row.actualWeight || "?"}kg×${row.actualReps || "?"}`
        : null;
    const extras = (row.subSteps ?? [])
      .filter((s) => s.weight.trim() || s.reps.trim())
      .map((s, i) => `${i + 2} ${s.weight || "?"}kg×${s.reps || "?"}`);
    const parts = [main, ...extras].filter(Boolean);
    return parts.length ? `Drop: ${parts.join(" → ")}` : null;
  }
  if (slug === "rest_pause") {
    const rest = row.miniRestSec?.trim();
    const main =
      row.actualWeight.trim() || row.actualReps.trim()
        ? `1 ${row.actualReps || "?"}@${row.actualWeight || "?"}kg`
        : null;
    const extras = (row.subSteps ?? [])
      .filter((s) => s.weight.trim() || s.reps.trim())
      .map((s, i) => `P${i + 2} ${s.reps || "?"}@${s.weight || "?"}kg`);
    const head = rest ? `RP ${rest}s` : "RP";
    const parts = [main, ...extras].filter(Boolean);
    return parts.length ? `${head}: ${parts.join(" · ")}` : rest ? head : null;
  }
  if (isTimedPerformSetType(slug) && row.workDurationSec?.trim()) {
    return `${slug === "amrap" ? "AMRAP" : "Tempo"} ${row.workDurationSec}s`;
  }
  return null;
}
