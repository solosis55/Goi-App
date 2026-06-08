import { Pressable, Text, View } from "react-native";
import type { DiscoverUser } from "../../types/auth";
import { discoverDisplayReason } from "../../utils/discoverDisplayReason";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { profileFollowButtonStyles as followStyles } from "../profile/profileFollowButtonStyles";
import { UserAvatar } from "../ui/UserAvatar";
import { feedSuggestionsStyles as styles } from "./feedSuggestionsStyles";

function MutualAvatars({
  preview,
  align = "center",
}: {
  preview: DiscoverUser["mutualPreview"];
  align?: "center" | "start";
}) {
  if (!preview?.length) return null;
  return (
    <View style={[styles.mutualRow, align === "start" ? styles.mutualRowStart : null]}>
      {preview.map((m) => (
        <View key={m.id} style={styles.mutualAvatarWrap}>
          <UserAvatar src={m.avatarUrl} username={m.username} size={16} />
        </View>
      ))}
    </View>
  );
}

type FeedSuggestionCardProps = {
  user: DiscoverUser;
  pending: boolean;
  followed: boolean;
  fullWidth?: boolean;
  layout?: "card" | "row";
  onOpenProfile: () => void;
  onFollow: () => void;
};

export function FeedSuggestionCard({
  user,
  pending,
  followed,
  fullWidth,
  layout = "card",
  onOpenProfile,
  onFollow,
}: FeedSuggestionCardProps) {
  const reason = discoverDisplayReason(user);
  const showPending = pending || user.followPending;

  if (layout === "row") {
    return (
      <View style={styles.listRow}>
        <Pressable
          onPress={onOpenProfile}
          style={({ pressed }) => [styles.listRowMain, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${user.username}`}
        >
          <View style={styles.listAvatarWrap}>
            <UserAvatar src={user.avatarUrl} username={user.username} size={40} />
            {user.activeThisWeek ? <View style={styles.listActiveDot} /> : null}
          </View>
          <View style={styles.listMeta}>
            <Text style={styles.listName} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{user.username}
            </Text>
            <View style={styles.listMetaLine}>
              {user.mutualPreview?.length ? (
                <MutualAvatars preview={user.mutualPreview} align="start" />
              ) : null}
              {reason ? (
                <Text style={styles.listHint} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {reason}
                </Text>
              ) : null}
            </View>
          </View>
        </Pressable>
        <Pressable
          onPress={onFollow}
          disabled={showPending || followed}
          style={({ pressed }) => [
            followStyles.base,
            followed || showPending ? followStyles.following : followStyles.primary,
            styles.listFollowBtn,
            pressed ? followStyles.pressed : null,
            showPending && !followed ? followStyles.busy : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            followed
              ? `Siguiendo a ${user.username}`
              : showPending
                ? `Solicitud pendiente a ${user.username}`
                : `Seguir a ${user.username}`
          }
        >
          <Text
            style={[
              followed || showPending ? followStyles.textFollowing : followStyles.textPrimary,
              styles.listFollowText,
            ]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {followed ? "Siguiendo" : showPending ? "Pendiente" : "Seguir"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.card, fullWidth ? styles.cardFullWidth : null]}>
      <View style={styles.cardAccent} />
      <View style={styles.cardBody}>
        <Pressable
          onPress={onOpenProfile}
          style={({ pressed }) => [styles.cardProfile, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${user.username}`}
        >
          <View style={styles.avatarRing}>
            <UserAvatar src={user.avatarUrl} username={user.username} size={44} />
            {user.activeThisWeek ? <View style={styles.activeDot} /> : null}
          </View>
          <View style={styles.identity}>
            <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{user.username}
            </Text>
            <MutualAvatars preview={user.mutualPreview} />
            <Text style={styles.hint} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {reason}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onFollow}
          disabled={showPending || followed}
          style={({ pressed }) => [
            followStyles.base,
            followed || showPending ? followStyles.following : followStyles.primary,
            styles.followBtn,
            pressed ? followStyles.pressed : null,
            showPending && !followed ? followStyles.busy : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            followed
              ? `Siguiendo a ${user.username}`
              : showPending
                ? `Solicitud pendiente a ${user.username}`
                : `Seguir a ${user.username}`
          }
        >
          <Text
            style={[followed || showPending ? followStyles.textFollowing : followStyles.textPrimary, styles.followText]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {followed ? "Siguiendo ✓" : showPending ? "Pendiente" : "Seguir"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
