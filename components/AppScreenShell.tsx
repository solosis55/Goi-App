import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";
import { AUTH } from "../constants/authUi";
import { AuthTopGlow } from "./AuthTopGlow";
import { FeedTopGlow } from "./FeedTopGlow";

export type AppScreenShellVariant = "default" | "feed";

/** Fondo negro + resplandor dorado superior (coherente con login e inicio). */
export function AppScreenShell({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: AppScreenShellVariant;
}) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: variant === "feed" ? "#030303" : AUTH.bg }}>
      <StatusBar style="light" />
      {variant === "feed" ? (
        <FeedTopGlow width={width} windowHeight={height} />
      ) : (
        <AuthTopGlow width={width} windowHeight={height} />
      )}
      {children}
    </View>
  );
}
