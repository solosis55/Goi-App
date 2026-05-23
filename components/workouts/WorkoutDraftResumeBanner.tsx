import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { WORKOUT_UI, workoutScreenStyles } from "../../constants/workoutScreenUi";
import {
  clearWorkoutCreateDraft,
  isMeaningfulWorkoutCreateDraft,
  readWorkoutCreateDraft,
} from "../../utils/workoutCreateDraft";
import {
  clearWorkoutEditDraft,
  isMeaningfulWorkoutEditDraft,
  readWorkoutEditDraft,
} from "../../utils/workoutEditDraft";
import { subscribeWorkoutDraftChanged } from "../../utils/workoutDraftEvents";
import { countPerformProgress, readActiveWorkoutSession } from "../../utils/workoutSessionPerform";

type ResumeTarget =
  | { kind: "perform"; workoutId: string; label: string; progress: string }
  | { kind: "create"; label: string }
  | { kind: "edit"; workoutId: string; label: string };

async function loadResumeTarget(): Promise<ResumeTarget | null> {
  const active = await readActiveWorkoutSession();
  if (active && active.blocks.length > 0) {
    const p = countPerformProgress(active.blocks);
    return {
      kind: "perform",
      workoutId: active.workoutId,
      label: active.workoutTitle,
      progress: `${p.completedSets}/${p.totalSets} series`,
    };
  }

  const [create, edit] = await Promise.all([readWorkoutCreateDraft(), readWorkoutEditDraft()]);
  if (edit && isMeaningfulWorkoutEditDraft(edit)) {
    const label = edit.title.trim() || "Rutina sin título";
    return { kind: "edit", workoutId: edit.workoutId, label };
  }
  if (create && isMeaningfulWorkoutCreateDraft(create)) {
    const label = create.title.trim() || "Nueva rutina sin título";
    return { kind: "create", label };
  }
  return null;
}

export function WorkoutDraftResumeBanner() {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const [target, setTarget] = useState<ResumeTarget | null>(null);

  const refresh = useCallback(() => {
    void loadResumeTarget().then(setTarget);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeWorkoutDraftChanged(refresh);
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  if (!target) return null;

  const onContinue = () => {
    if (target.kind === "perform") {
      router.push({ pathname: "/entrenar/[workoutId]", params: { workoutId: target.workoutId } });
      return;
    }
    if (target.kind === "create") {
      router.push("/rutina/nueva");
      return;
    }
    router.push({ pathname: "/rutina/[id]", params: { id: target.workoutId } });
  };

  const onDiscardDraft = () => {
    showAlert({
      title: "Eliminar borrador",
      message: "Se perderán los cambios locales que no hayas guardado en la rutina.",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            void (async () => {
              if (target.kind === "create") {
                await clearWorkoutCreateDraft();
              } else if (target.kind === "edit") {
                await clearWorkoutEditDraft();
              }
              refresh();
            })();
          },
        },
      ],
    });
  };

  const isPerform = target.kind === "perform";
  const kicker = isPerform ? "Entrenamiento en curso" : "Borrador en curso";

  return (
    <View style={[styles.banner, isPerform ? styles.bannerLive : styles.bannerDraft]}>
      <View style={workoutScreenStyles.cardGlowLine} />
      <Pressable
        onPress={onContinue}
        style={({ pressed }) => [styles.mainHit, pressed ? workoutScreenStyles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`Continuar: ${target.label}`}
      >
        <View style={[styles.iconWrap, isPerform ? styles.iconWrapLive : null]}>
          <Text style={[styles.iconChar, isPerform ? styles.iconCharLive : null]}>{isPerform ? "▶" : "✎"}</Text>
        </View>
        <View style={styles.textCol}>
          <Text style={styles.kicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {kicker}
          </Text>
          <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {target.label}
          </Text>
          {isPerform ? (
            <Text style={styles.subProgress} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {target.progress}
            </Text>
          ) : null}
        </View>
      </Pressable>

      <View style={styles.actionsCol}>
        <Pressable
          onPress={onContinue}
          style={({ pressed }) => [styles.actionBtn, pressed ? workoutScreenStyles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Continuar"
        >
          <Text style={[styles.cta, isPerform ? styles.ctaLive : null]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Continuar
          </Text>
        </Pressable>
        {!isPerform ? (
          <Pressable
            onPress={onDiscardDraft}
            style={({ pressed }) => [styles.discardBtn, pressed ? workoutScreenStyles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Eliminar borrador"
          >
            <Text style={styles.discardText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Eliminar
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  bannerLive: {
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: WORKOUT_UI.surfaceCard,
  },
  bannerDraft: {
    borderColor: AUTH.cardBorder,
    backgroundColor: WORKOUT_UI.surfaceCard,
  },
  mainHit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(10, 10, 12, 0.6)",
  },
  iconWrapLive: {
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.6)",
  },
  iconChar: {
    fontSize: 15,
    fontWeight: "700",
    color: AUTH.muted,
  },
  iconCharLive: {
    color: AUTH.gold,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  kicker: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
  },
  subProgress: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  actionsCol: {
    alignItems: "flex-end",
    gap: 6,
    flexShrink: 0,
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  cta: authScreenStyles.linkText,
  ctaLive: authScreenStyles.linkText,
  discardBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.45)",
    backgroundColor: "rgba(40, 20, 20, 0.4)",
  },
  discardText: {
    color: AUTH.danger,
    fontSize: 11,
    fontWeight: "700",
  },
});
