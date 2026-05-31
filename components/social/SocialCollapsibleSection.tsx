import { useCallback, useEffect, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useSocialUiStore } from "../../stores/useSocialUiStore";
import { ProfileSectionSurface } from "../profile/ProfileSectionSurface";

type SocialCollapsibleSectionProps = {
  id: string;
  title: string;
  subtitle?: string;
  defaultCollapsed?: boolean;
  children: ReactNode;
};

export function SocialCollapsibleSection({
  id,
  title,
  subtitle,
  defaultCollapsed = false,
  children,
}: SocialCollapsibleSectionProps) {
  const hydrate = useSocialUiStore((s) => s.hydrate);
  const collapsed = useSocialUiStore((s) =>
    s.hydrated ? (s.collapsedSectionIds.includes(id) ? true : defaultCollapsed) : defaultCollapsed
  );
  const setSectionCollapsed = useSocialUiStore((s) => s.setSectionCollapsed);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const toggle = useCallback(() => {
    setSectionCollapsed(id, !collapsed);
  }, [id, collapsed, setSectionCollapsed]);

  return (
    <ProfileSectionSurface flush goldLine>
      <View style={styles.pad}>
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [styles.header, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityState={{ expanded: !collapsed }}
        >
          <View style={styles.headerText}>
            <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <Text style={styles.chevron} accessible={false}>
            {collapsed ? "›" : "⌄"}
          </Text>
        </Pressable>
        {!collapsed ? <View style={styles.body}>{children}</View> : null}
      </View>
    </ProfileSectionSurface>
  );
}

const styles = StyleSheet.create({
  pad: {
    padding: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  headerText: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  subtitle: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  chevron: {
    color: AUTH.gold,
    fontSize: 18,
    fontWeight: "600",
    marginTop: -2,
  },
  body: {
    marginTop: 12,
    gap: 10,
  },
  pressed: {
    opacity: 0.88,
  },
});
