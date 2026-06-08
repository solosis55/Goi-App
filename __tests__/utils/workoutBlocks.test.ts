import { blocksFromLegacy, createBlockForExercise } from "../../utils/workoutBlocks";
import type { WorkoutExerciseBlock } from "../../types/workout";

describe("blocksFromLegacy", () => {
  it("usa exerciseBlocks cuando existen", () => {
    const blocks: WorkoutExerciseBlock[] = [
      {
        exerciseId: "ex-1",
        equipmentSlug: "barra",
        laterality: "bilateral",
        sets: [{ reps: "10", weight: "60", setType: "normal" }],
      },
    ];

    expect(blocksFromLegacy(["legacy-id"], blocks)).toEqual(blocks);
  });

  it("genera bloques desde exerciseIds legacy", () => {
    const result = blocksFromLegacy(["ex-a", "ex-b"], undefined);

    expect(result).toHaveLength(2);
    expect(result[0]?.exerciseId).toBe("ex-a");
    expect(result[1]?.exerciseId).toBe("ex-b");
    expect(result[0]?.sets).toHaveLength(1);
  });

  it("normaliza laterality y rellena sets vacíos", () => {
    const result = blocksFromLegacy(undefined, [
      {
        exerciseId: "ex-1",
        equipmentSlug: "  ",
        laterality: "unilateral",
        sets: [],
      },
    ]);

    expect(result[0]?.laterality).toBe("unilateral");
    expect(result[0]?.equipmentSlug).toBe("");
    expect(result[0]?.sets).toEqual([createBlockForExercise("x").sets[0]]);
  });

  it("devuelve array vacío sin ids ni blocks", () => {
    expect(blocksFromLegacy(undefined, undefined)).toEqual([]);
    expect(blocksFromLegacy([], [])).toEqual([]);
  });
});
