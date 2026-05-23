import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { View, useWindowDimensions } from "react-native";
import { AUTH } from "../constants/authUi";
import { AuthTopGlow } from "./AuthTopGlow";

/** Fondo negro + resplandor dorado superior (coherente con login e inicio). */
export function AppScreenShell({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={{ flex: 1, backgroundColor: AUTH.bg }}>
      <StatusBar style="light" />
      <AuthTopGlow width={width} windowHeight={height} />
      {children}
    </View>
  );
}
