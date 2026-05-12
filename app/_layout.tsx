import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import { Stack } from "expo-router";
import { useGoiTheme } from "../constants/theme";

function ThemedRoot() {
  const { colorScheme } = useGoiTheme();

  return (
    <GluestackUIProvider config={config} colorMode={colorScheme}>
      <Stack />
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return <ThemedRoot />;
}
