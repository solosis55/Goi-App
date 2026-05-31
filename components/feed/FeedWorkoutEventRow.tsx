import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FeedWorkoutEvent } from "../../types/post";
import { formatPostRelative } from "../../utils/feedPostDate";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";
import { UserAvatar } from "../ui/UserAvatar";

type FeedWorkoutEventRowProps = {
  event: FeedWorkoutEvent;
  onOpenAuthor?: (userId: string) => void;
};

export function FeedWorkoutEventRow({ event, onOpenAuthor }: FeedWorkoutEventRowProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        onOpenAuthor
          ? onOpenAuthor(event.userId)
          : router.push({ pathname: "/usuario/[id]", params: { id: event.userId } })
      }
      style={({ pressed }) => [styles.wrap, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel={`${event.authorUsername} entrenó ${event.workoutTitle}`}
    >
      <UserAvatar src={event.authorAvatarUrl} username={event.authorUsername} size={40} />
      <View style={styles.body}>
        <Text style={styles.line} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          <Text style={styles.user}>@{event.authorUsername}</Text>
          {" completó un entreno"}
        </Text>
        <View style={styles.metaRow}>
          <TabDumbbellIcon size={13} color={AUTH.gold} filled />
          <Text style={styles.meta} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {event.workoutTitle}
          </Text>
          <Text style={styles.time} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {formatPostRelative(event.performedAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.18)",
    backgroundColor: "rgba(18, 18, 20, 0.75)",
  },
  body: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  line: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 19,
  },
  user: {
    color: AUTH.neutral100,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minWidth: 0,
  },
  meta: {
    flex: 1,
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  time: {
    color: AUTH.faint,
    fontSize: 11,
  },
  pressed: {
    opacity: 0.88,
  },
});
