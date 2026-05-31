import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import type { PostFormat } from "../../../constants/postFormat";
import {
  ToolbarPhotoIcon,
  ToolbarSessionIcon,
  ToolbarSettingsIcon,
  ToolbarTextIcon,
} from "./CreatePostToolbarIcons";

export type CreatePostToolbarAction = "text" | "media" | "session" | "options";

type CreatePostToolbarProps = {
  format: PostFormat;
  hasSession: boolean;
  imageCount: number;
  activePanel?: CreatePostToolbarAction | null;
  onPress: (action: CreatePostToolbarAction) => void;
};

type ToolDef = {
  action: CreatePostToolbarAction;
  label: string;
  badge?: number;
  active?: boolean;
  icon: (active: boolean) => ReactNode;
};

export function CreatePostToolbar({
  format,
  hasSession,
  imageCount,
  activePanel,
  onPress,
}: CreatePostToolbarProps) {
  const gold = AUTH.gold;
  const muted = AUTH.muted;

  const tools: ToolDef[] =
    format === "training"
      ? [
          {
            action: "session",
            label: "Sesión",
            active: hasSession || activePanel === "session",
            icon: (a) => <ToolbarSessionIcon color={a ? gold : muted} filled={hasSession} />,
          },
          {
            action: "text",
            label: "Texto",
            active: activePanel === "text",
            icon: (a) => <ToolbarTextIcon color={a ? gold : muted} />,
          },
          {
            action: "media",
            label: "Fotos",
            badge: imageCount > 0 ? imageCount : undefined,
            active: activePanel === "media",
            icon: (a) => <ToolbarPhotoIcon color={a ? gold : muted} />,
          },
          {
            action: "options",
            label: "Ajustes",
            active: activePanel === "options",
            icon: (a) => <ToolbarSettingsIcon color={a ? gold : muted} />,
          },
        ]
      : [
          {
            action: "media",
            label: "Foto",
            badge: imageCount > 0 ? imageCount : undefined,
            active: activePanel === "media",
            icon: (a) => <ToolbarPhotoIcon color={a ? gold : muted} />,
          },
          {
            action: "text",
            label: "Texto",
            active: activePanel === "text",
            icon: (a) => <ToolbarTextIcon color={a ? gold : muted} />,
          },
          {
            action: "session",
            label: "Sesión",
            active: hasSession || activePanel === "session",
            icon: (a) => <ToolbarSessionIcon color={a ? gold : muted} filled={hasSession} />,
          },
          {
            action: "options",
            label: "Ajustes",
            active: activePanel === "options",
            icon: (a) => <ToolbarSettingsIcon color={a ? gold : muted} />,
          },
        ];

  return (
    <View style={styles.bar}>
      {tools.map((tool) => {
        const active = tool.active ?? activePanel === tool.action;
        return (
          <Pressable
            key={tool.action}
            onPress={() => onPress(tool.action)}
            style={({ pressed }) => [styles.btn, active ? styles.btnActive : null, pressed ? styles.pressed : null]}
            accessibilityRole="button"
            accessibilityLabel={tool.label}
          >
            <View style={styles.iconWrap}>
              {tool.icon(active)}
              {tool.badge != null && tool.badge > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {tool.badge > 9 ? "9+" : tool.badge}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[styles.label, active ? styles.labelActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {tool.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  btn: {
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    minWidth: 64,
  },
  btnActive: {
    backgroundColor: "rgba(35, 32, 22, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: AUTH.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#000",
    fontSize: 9,
    fontWeight: "800",
  },
  label: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  labelActive: {
    color: AUTH.gold,
  },
  pressed: { opacity: 0.88 },
});
