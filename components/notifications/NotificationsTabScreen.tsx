import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenShell } from "../AppScreenShell";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useSocialHub } from "../../context/SocialHubContext";
import { NotificationsList } from "./NotificationsList";

type NotificationsTabScreenProps = {
  showBack?: boolean;
  /** Dentro del tab Social con segmentos (sin cabecera duplicada). */
  embedded?: boolean;
};

export function NotificationsTabScreen({ showBack = false, embedded = false }: NotificationsTabScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { refreshBadge } = useSocialHub();

  useFocusEffect(
    useCallback(() => {
      void refreshBadge();
    }, [refreshBadge])
  );

  const onOpenActor = useCallback(
    (userId: string) => {
      router.push(`/usuario/${userId}`);
    },
    [router]
  );

  const onOpenPost = useCallback(
    (postId: string, commentId?: string) => {
      router.push({
        pathname: "/(tabs)",
        params: commentId
          ? { focusPostId: postId, focusCommentId: commentId }
          : { focusPostId: postId },
      });
    },
    [router]
  );

  const body = (
    <>
      {embedded ? null : (
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
        {showBack ? (
          <View style={styles.headerTopRow}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Volver"
              style={({ pressed }) => [styles.backBtn, pressed ? styles.backPressed : null]}
            >
              <Text style={styles.backText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                ←
              </Text>
            </Pressable>
            <Text style={styles.titleInline} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Notificaciones
            </Text>
            <View style={styles.backBtn} />
          </View>
        ) : (
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Notificaciones
          </Text>
        )}
        <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Me gusta, comentarios y nuevos seguidores
        </Text>
      </View>
      )}
      <View style={[styles.listWrap, embedded ? styles.listWrapEmbedded : null]}>
        <NotificationsList
          onOpenActor={onOpenActor}
          onOpenPost={onOpenPost}
          onUnreadChange={() => void refreshBadge()}
        />
      </View>
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedRoot}>{body}</View>;
  }

  return <AppScreenShell variant="feed">{body}</AppScreenShell>;
}

const styles = StyleSheet.create({
  embeddedRoot: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backPressed: {
    opacity: 0.65,
  },
  backText: {
    color: AUTH.gold,
    fontSize: 22,
    fontWeight: "600",
  },
  titleInline: {
    flex: 1,
    textAlign: "center",
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 4,
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  listWrap: {
    flex: 1,
  },
  listWrapEmbedded: {
    minHeight: 0,
  },
});
