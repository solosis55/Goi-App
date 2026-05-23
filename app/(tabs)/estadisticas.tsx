import { Box, Text } from "@gluestack-ui/themed";
import { Redirect, Stack } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppScreenShell } from "../../components/AppScreenShell";
import { TabStatsIcon } from "../../components/navigation/TabBarIcons";
import { APP_STACK_SCREEN_OPTIONS, AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function EstadisticasScreen() {
  const { palette, typography } = useGoiTheme();
  const { isHydrated, isAuthenticated } = useAuth();

  if (!isHydrated) {
    return <Box flex={1} style={{ backgroundColor: palette.background }} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          ...APP_STACK_SCREEN_OPTIONS,
          title: "Estadísticas",
          headerShown: true,
        }}
      />
      <AppScreenShell>
        <View style={styles.wrap}>
          <View style={styles.iconRing}>
            <TabStatsIcon size={40} color={AUTH.gold} filled />
          </View>
          <Text
            style={[styles.title, { fontSize: typography.fontSize.xl }]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            Estadísticas
          </Text>
          <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Resumen de entrenos, progreso y actividad en la comunidad. Esta pantalla se implementará más
            adelante.
          </Text>
        </View>
      </AppScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingBottom: 48,
    gap: 14,
  },
  iconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    color: AUTH.neutral100,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    color: AUTH.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 360,
  },
});
