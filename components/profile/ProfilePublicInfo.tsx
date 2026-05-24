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
  activityLine?: string | null;
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
  activityLine,
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

      {hasLocation ? (
        <View style={styles.locationRow}>
          <ProfileLocationIcon color={AUTH.muted} />
          <Text style={styles.location} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {location!.trim()}
          </Text>
        </View>
      ) : null}

      {hasGoal ? (
        <Text style={styles.goalHeadline} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {goal!.trim()}
        </Text>
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
              style={({ pressed }) => [styles.linkIconBtn, pressed ? styles.pressed : null]}
              accessibilityRole="link"
              accessibilityLabel="Sitio web"
            >
              <ProfileLinkWebIcon color={AUTH.gold} />
            </Pressable>
          ) : null}
          {instagramUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(instagramUrl)}
              style={({ pressed }) => [styles.linkIconBtn, pressed ? styles.pressed : null]}
              accessibilityRole="link"
              accessibilityLabel="Instagram"
            >
              <ProfileLinkInstagramIcon color={AUTH.gold} />
            </Pressable>
          ) : null}
          {stravaUrl?.trim() ? (
            <Pressable
              onPress={() => openUrl(stravaUrl)}
              style={({ pressed }) => [styles.linkIconBtn, pressed ? styles.pressed : null]}
              accessibilityRole="link"
              accessibilityLabel="Strava"
            >
              <ProfileLinkStravaIcon color={AUTH.gold} />
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
  goalHeadline: {
    color: "rgba(240, 216, 120, 0.92)",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
    letterSpacing: -0.15,
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
    gap: 10,
    marginTop: 4,
  },
  linkIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
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
