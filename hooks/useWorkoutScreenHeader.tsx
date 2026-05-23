import { useNavigation } from "expo-router";
import type { ReactNode } from "react";
import { useLayoutEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { APP_STACK_SCREEN_OPTIONS, AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../constants/authUi";

type Options = {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  statusMaxWidth?: number;
  headerIcons?: ReactNode;
  onBack?: () => void;
  onMenuPress?: () => void;
};

function HeaderTitle({ title }: { title: string }) {
  return (
    <Text
      numberOfLines={1}
      ellipsizeMode="tail"
      style={{
        color: AUTH.neutral100,
        fontSize: 17,
        fontWeight: "600",
        textAlign: "center",
        maxWidth: 220,
      }}
      maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
    >
      {title}
    </Text>
  );
}

function HeaderStatus({ label, maxWidth = 108 }: { label: string; maxWidth?: number }) {
  const isDirty = label.includes("Sin");
  const isSaving = label.includes("Guardando");
  const isSaved = label === "Guardado";
  const isPaused = label.includes("Pausa");

  return (
    <View style={[statusStyles.wrap, { maxWidth }]}>
      <View
        style={[
          statusStyles.dot,
          isDirty ? statusStyles.dotDirty : null,
          isSaving ? statusStyles.dotSaving : null,
          isSaved ? statusStyles.dotSaved : null,
          isPaused ? statusStyles.dotPaused : null,
        ]}
      />
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          statusStyles.text,
          isDirty ? statusStyles.textDirty : null,
          isSaved ? statusStyles.textSaved : null,
          isPaused ? statusStyles.textPaused : null,
        ]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        {label}
      </Text>
    </View>
  );
}

function HeaderMenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      style={{
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
      }}
      accessibilityRole="button"
      accessibilityLabel="Opciones del entrenamiento"
    >
      <Text
        style={{ color: AUTH.gold, fontSize: 22, fontWeight: "600", lineHeight: 24 }}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        ⋯
      </Text>
    </Pressable>
  );
}

export function useWorkoutScreenHeader({
  title,
  statusLabel,
  statusMaxWidth,
  headerIcons,
  onBack,
  onMenuPress,
}: Options) {
  const navigation = useNavigation();
  const showRight = Boolean(statusLabel || onMenuPress || headerIcons);

  useLayoutEffect(() => {
    navigation.setOptions({
      ...APP_STACK_SCREEN_OPTIONS,
      headerShown: true,
      title: "",
      headerBackTitleVisible: false,
      headerBackVisible: !onBack,
      headerTitleAlign: "center",
      headerTitle: () => <HeaderTitle title={title} />,
      headerLeftContainerStyle: { paddingLeft: Platform.OS === "ios" ? 4 : 0 },
      headerRightContainerStyle: { paddingRight: 8, minWidth: showRight ? 168 : 44 },
      headerLeft: onBack
        ? () => (
            <Pressable
              onPress={onBack}
              hitSlop={12}
              style={{
                width: 44,
                height: 44,
                justifyContent: "center",
                alignItems: "center",
                marginLeft: Platform.OS === "ios" ? -4 : 0,
              }}
              accessibilityRole="button"
              accessibilityLabel="Volver"
            >
              <Text
                style={{ color: AUTH.gold, fontSize: 32, fontWeight: "300", lineHeight: 34 }}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                ‹
              </Text>
            </Pressable>
          )
        : undefined,
      headerRight: showRight
        ? () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 0, maxWidth: 200 }}>
              {headerIcons}
              {statusLabel ? <HeaderStatus label={statusLabel} maxWidth={statusMaxWidth} /> : null}
              {onMenuPress ? <HeaderMenuButton onPress={onMenuPress} /> : null}
            </View>
          )
        : undefined,
    });
  }, [navigation, title, statusLabel, statusMaxWidth, headerIcons, onBack, onMenuPress, showRight]);
}

const statusStyles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 108,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: AUTH.muted,
  },
  dotDirty: {
    backgroundColor: "#fbbf24",
  },
  dotSaving: {
    backgroundColor: AUTH.gold,
  },
  dotSaved: {
    backgroundColor: "rgba(134, 239, 172, 0.9)",
  },
  dotPaused: {
    backgroundColor: "#fbbf24",
  },
  text: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
  },
  textDirty: {
    color: AUTH.gold,
  },
  textSaved: {
    color: AUTH.muted,
  },
  textPaused: {
    color: "#fbbf24",
  },
});

export function WorkoutHeaderIconButton({
  onPress,
  active,
  accessibilityLabel,
  children,
}: {
  onPress: () => void;
  active?: boolean;
  accessibilityLabel: string;
  children: ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[headerIconStyles.btn, active ? headerIconStyles.btnActive : null]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}

const headerIconStyles = StyleSheet.create({
  btn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  btnActive: {
    backgroundColor: "rgba(35, 32, 22, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
});
