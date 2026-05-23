import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getExercises } from "../api/exercises";
import { createWorkout, updateWorkout } from "../api/workouts";
import {
  WORKOUT_DESCRIPTION_MAX,
  WORKOUT_EXERCISES_MAX,
  WORKOUT_TAGS_MAX_COUNT,
  WORKOUT_TITLE_MIN,
} from "../constants/workoutFormLimits";
import type { Exercise } from "../types/exercise";
import type { Workout, WorkoutExerciseBlock } from "../types/workout";
import { blocksFromLegacy } from "../utils/workoutBlocks";
import {
  clearWorkoutCreateDraft,
  readWorkoutCreateDraft,
  writeWorkoutCreateDraft,
} from "../utils/workoutCreateDraft";
import {
  clearWorkoutEditDraft,
  readWorkoutEditDraft,
  writeWorkoutEditDraft,
} from "../utils/workoutEditDraft";
import { parseTagsInput, tagsToInputValue } from "../utils/workoutEditorMetrics";
import { getErrorMessage } from "../utils/errorMessages";

type UseWorkoutEditorArgs =
  | { mode: "create" }
  | { mode: "edit"; workout: Workout };

type Snapshot = {
  title: string;
  description: string;
  tagsInput: string;
  exerciseBlocks: WorkoutExerciseBlock[];
};

function snapshotFromState(
  title: string,
  description: string,
  tagsInput: string,
  exerciseBlocks: WorkoutExerciseBlock[]
): Snapshot {
  return {
    title,
    description,
    tagsInput,
    exerciseBlocks: JSON.parse(JSON.stringify(exerciseBlocks)) as WorkoutExerciseBlock[],
  };
}

function snapshotsEqual(a: Snapshot, b: Snapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useWorkoutEditor(args: UseWorkoutEditorArgs) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [exerciseBlocks, setExerciseBlocks] = useState<WorkoutExerciseBlock[]>([]);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  /** Evita sobrescribir el borrador antes de hidratar desde AsyncStorage. */
  const [createDraftReady, setCreateDraftReady] = useState(false);
  const baselineRef = useRef<Snapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getExercises()
      .then((list) => {
        if (!cancelled) {
          setCatalog(list);
          setCatalogError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setCatalogError(getErrorMessage(e, "No se pudo cargar el catálogo"));
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    setCreateDraftReady(false);

    if (args.mode === "edit") {
      const w = args.workout;
      const serverBlocks = blocksFromLegacy(w.exerciseIds, w.exerciseBlocks);
      const serverTags = tagsToInputValue(w.tags ?? []);
      const serverSnap = snapshotFromState(w.title, w.description, serverTags, serverBlocks);

      void readWorkoutEditDraft().then((draft) => {
        if (cancelled) return;
        const useDraft = draft?.workoutId === w.id;
        const nextTitle = useDraft ? draft.title : w.title;
        const nextDesc = useDraft ? draft.description : w.description;
        const nextTags = useDraft ? draft.tagsInput : serverTags;
        const nextBlocks = useDraft ? draft.exerciseBlocks : serverBlocks;
        setTitle(nextTitle);
        setDescription(nextDesc);
        setTagsInput(nextTags);
        setExerciseBlocks(nextBlocks);
        baselineRef.current = serverSnap;
        setHydrated(true);
      });
      return () => {
        cancelled = true;
      };
    }

    void readWorkoutCreateDraft().then((d) => {
      if (cancelled) return;
      const nextTitle = d?.title ?? "";
      const nextDesc = d?.description ?? "";
      const nextTags = tagsToInputValue(d?.tags ?? []);
      const nextBlocks = blocksFromLegacy(d?.exerciseIds, d?.exerciseBlocks).slice(0, WORKOUT_EXERCISES_MAX);
      setTitle(nextTitle);
      setDescription(nextDesc);
      setTagsInput(nextTags);
      setExerciseBlocks(nextBlocks);
      baselineRef.current = snapshotFromState(nextTitle, nextDesc, nextTags, nextBlocks);
      setCreateDraftReady(true);
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, [args]);

  useEffect(() => {
    if (args.mode !== "create" || !createDraftReady) return;
    const t = setTimeout(() => {
      void writeWorkoutCreateDraft({
        title,
        description,
        exerciseBlocks,
        tags: parseTagsInput(tagsInput),
      });
    }, 300);
    return () => clearTimeout(t);
  }, [args.mode, createDraftReady, title, description, exerciseBlocks, tagsInput]);

  const catalogById = useMemo(() => new Map(catalog.map((e) => [e.id, e])), [catalog]);

  const currentSnapshot = useMemo(
    () => snapshotFromState(title, description, tagsInput, exerciseBlocks),
    [title, description, tagsInput, exerciseBlocks]
  );

  const isDirty = useMemo(() => {
    if (!baselineRef.current) return false;
    return !snapshotsEqual(baselineRef.current, currentSnapshot);
  }, [currentSnapshot]);

  useEffect(() => {
    if (args.mode !== "edit" || !hydrated) return;
    if (!isDirty) {
      void clearWorkoutEditDraft();
      return;
    }
    const t = setTimeout(() => {
      void writeWorkoutEditDraft({
        workoutId: args.workout.id,
        title,
        description,
        tagsInput,
        exerciseBlocks,
      });
    }, 300);
    return () => clearTimeout(t);
  }, [args, hydrated, isDirty, title, description, tagsInput, exerciseBlocks]);

  const titleTrim = title.trim();
  const titleTooShort = titleTrim.length > 0 && titleTrim.length < WORKOUT_TITLE_MIN;

  const canSave = useMemo(() => {
    return (
      titleTrim.length >= WORKOUT_TITLE_MIN &&
      description.length <= WORKOUT_DESCRIPTION_MAX &&
      exerciseBlocks.length > 0 &&
      exerciseBlocks.length <= WORKOUT_EXERCISES_MAX
    );
  }, [titleTrim, description, exerciseBlocks]);

  const save = useCallback(async (): Promise<Workout | null> => {
    setError(null);
    if (titleTrim.length < WORKOUT_TITLE_MIN) {
      setError("El título debe tener al menos 3 caracteres");
      return null;
    }
    if (description.length > WORKOUT_DESCRIPTION_MAX) {
      setError("La descripción no puede superar 280 caracteres");
      return null;
    }
    if (exerciseBlocks.length === 0) {
      setError("Añade al menos un ejercicio");
      return null;
    }
    if (exerciseBlocks.length > WORKOUT_EXERCISES_MAX) {
      setError(`Como máximo ${WORKOUT_EXERCISES_MAX} ejercicios`);
      return null;
    }

    const tags = parseTagsInput(tagsInput).slice(0, WORKOUT_TAGS_MAX_COUNT);

    setSaving(true);
    try {
      const payload = { title: titleTrim, description, exerciseBlocks, tags };
      const saved =
        args.mode === "edit"
          ? await updateWorkout(args.workout.id, payload)
          : await createWorkout(payload);
      baselineRef.current = snapshotFromState(titleTrim, description, tagsInput, exerciseBlocks);
      if (args.mode === "create") {
        await clearWorkoutCreateDraft();
      } else {
        await clearWorkoutEditDraft();
      }
      return saved;
    } catch (e) {
      setError(
        getErrorMessage(
          e,
          args.mode === "edit" ? "No se pudo actualizar la rutina" : "No se pudo crear la rutina"
        )
      );
      return null;
    } finally {
      setSaving(false);
    }
  }, [args, titleTrim, description, exerciseBlocks, tagsInput]);

  return {
    title,
    setTitle,
    description,
    setDescription,
    tagsInput,
    setTagsInput,
    exerciseBlocks,
    setExerciseBlocks,
    catalog,
    catalogById,
    catalogLoading,
    catalogError,
    saving,
    error,
    setError,
    canSave,
    isDirty,
    titleTooShort,
    save,
    hydrated,
    isEdit: args.mode === "edit",
  };
}
