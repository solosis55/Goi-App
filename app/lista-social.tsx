import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenShell } from "../components/AppScreenShell";
import { ProfileSocialList } from "../components/profile/ProfileSocialList";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../constants/authUi";
import {
  socialListScreenTitle,
  type SocialListKind,
} from "../constants/socialListRoutes";
import { useAuth } from "../context/AuthContext";

function parseKind(raw: string | undefined): SocialListKind | null {
  if (raw === "followers" || raw === "following") return raw;
  return null;
}

export default function ListaSocialScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ userId?: string; kind?: string; username?: string }>();

  const param = (key: "userId" | "kind" | "username"): string | undefined => {
    const raw = params[key];
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw) && typeof raw[0] === "string") return raw[0];
    return undefined;
  };

  const userId = param("userId") ?? "";
  const kind = parseKind(param("kind"));
  const username = param("username");

  const title = kind ? socialListScreenTitle(kind, username) : "Lista";

  const handleFollowingChanged = useCallback(() => {
    /* Los contadores del perfil se refrescan al volver con useFocusEffect */
  }, []);

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!userId || !kind) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreenShell variant="feed">
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.backBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.backText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              ←
            </Text>
          </Pressable>
          <Text style={styles.title} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {title}
          </Text>
          <View style={styles.backBtn} />
        </View>

        <ProfileSocialList userId={userId} kind={kind} onFollowingChanged={handleFollowingChanged} />
      </AppScreenShell>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: AUTH.neutral100,
    fontSize: 22,
  },
  title: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  pressed: {
    opacity: 0.88,
  },
});
