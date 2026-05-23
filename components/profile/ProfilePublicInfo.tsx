import type { ReactNode } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { ProfileBadge } from "../../utils/profileBadges";
import { ProfileBadgesRow } from "./ProfileBadgesRow";
import {
  ProfileLinkInstagramIcon,
  ProfileLinkStravaIcon,
  ProfileLinkWebIcon,
  ProfileLocationIcon,
} from "./ProfileLinkIcons";
import { ProfileWorkoutStatsBar, type ProfileWorkoutStatsBarProps } from "./ProfileWorkoutStatsBar";

export type ProfilePublicInfoProps = {
  bio?: string;
  goal?: string;
  location?: string;
  websiteUrl?: string;
  instagramUrl?: string;
  stravaUrl?: string;
  restricted?: boolean;
  restrictedMessage?: string;
  showEditHint?: boolean;
  onEditProfile?: () => void;
  badges?: ProfileBadge[];
  workoutStats?: ProfileWorkoutStatsBarProps;
  activityLine?: string | null;
  workoutSummary?: ReactNode;
};

function openUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return;
  void Linking.openURL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
}

export function ProfilePublicInfo({
  bio,
  goal,
  location,
  websiteUrl,
  instagramUrl,
  stravaUrl,
  restricted,
  restrictedMessage,
  showEditHint,
  onEditProfile,
  badges = [],
  workoutStats,
  activityLine,
  workoutSummary,
}: ProfilePublicInfoProps) {
  if (restricted && restrictedMessage) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.kicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sobre mí
        </Text>
        <Text style={styles.restricted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {restrictedMessage}
        </Text>
      </View>
    );
  }

  if (restricted) return null;

  const hasLinks = Boolean(websiteUrl?.trim() || instagramUrl?.trim() || stravaUrl?.trim());
  const hasBio = Boolean(bio?.trim());
  const hasGoal = Boolean(goal?.trim());
  const hasLocation = Boolean(location?.trim());
  const isEmpty = !hasBio && !hasGoal && !hasLocation && !hasLinks;

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <Text style={styles.kicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sobre mí
        </Text>
        {showEditHint && onEditProfile ? (
          <Pressable
            onPress={onEditProfile}
            style={({ pressed }) => [styles.editBtn, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel="Editar perfil"
          >
            <Text style={styles.editBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Editar perfil
            </Text>
          </Pressable>
        ) : null}
      </View>

      {activityLine ? (
        <Text style={styles.activityLine} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {activityLine}
        </Text>
      ) : null}

      {workoutStats ? <ProfileWorkoutStatsBar {...workoutStats} /> : null}

      {workoutSummary}

      {hasLocation ? (
        <View style={styles.locationRow}>
          <ProfileLocationIcon color={AUTH.muted} />
          <Text style={styles.location} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {location!.trim()}
          </Text>
        </View>
      ) : null}

      {hasGoal ? (
        <View style={styles.goalRow}>
          <Text style={styles.goalIcon} accessibilityElementsHidden>
            🎯
          </Text>
          <Text style={styles.goal} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {goal!.trim()}
          </Text>
        </View>
      ) : null}

      <ProfileBadgesRow badges={badges} />

      {hasBio ? (
        <Text style={styles.bio} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {bio!.trim()}
        </Text>
      ) : isEmpty && showEditHint ? (
        <Pressable
          onPress={onEditProfile}
          style={({ pressed }) => [styles.emptyCard, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Completar perfil"
        >
          <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Completa tu perfil
          </Text>
          <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Añade biografía, objetivo y enlaces para que te conozcan mejor.
          </Text>
        </Pressable>
      ) : showEditHint && !hasBio ? (
        <Text style={styles.bioMuted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sin biografía todavía.
        </Text>
      ) : null}

      {hasLinks ? (
        <View style={styles.links}>
          {websiteUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(websiteUrl)}
              style={({ pressed }) => [styles.linkChip, pressed ? styles.pressed : null]}
              accessibilityRole="link"
            >
              <ProfileLinkWebIcon color={AUTH.gold} />
              <Text style={styles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Web
              </Text>
            </Pressable>
          ) : null}
          {instagramUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(instagramUrl)}
              style={({ pressed }) => [styles.linkChip, pressed ? styles.pressed : null]}
              accessibilityRole="link"
            >
              <ProfileLinkInstagramIcon color={AUTH.gold} />
              <Text style={styles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Instagram
              </Text>
            </Pressable>
          ) : null}
          {stravaUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(stravaUrl)}
              style={({ pressed }) => [styles.linkChip, pressed ? styles.pressed : null]}
              accessibilityRole="link"
            >
              <ProfileLinkStravaIcon color={AUTH.gold} />
              <Text style={styles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Strava
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  kicker: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  editBtnText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  location: {
    color: AUTH.muted,
    fontSize: 13,
    flex: 1,
  },
  activityLine: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  goalIcon: {
    fontSize: 15,
    lineHeight: 20,
  },
  goal: {
    flex: 1,
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  bio: {
    color: AUTH.steel,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 2,
  },
  bioMuted: {
    color: AUTH.faint,
    fontSize: 13,
    fontStyle: "italic",
  },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  linkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
    backgroundColor: "rgba(23, 23, 23, 0.8)",
  },
  linkText: {
    color: AUTH.neutral100,
    fontSize: 12,
    fontWeight: "600",
  },
  emptyCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(23, 23, 23, 0.45)",
    gap: 6,
  },
  emptyTitle: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  restricted: {
    color: AUTH.steel,
    fontSize: 14,
    lineHeight: 20,
  },
  pressed: {
    opacity: 0.88,
  },
});
