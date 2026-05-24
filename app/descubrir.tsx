import { Stack } from "expo-router";
import { SocialDiscoverScreen } from "../components/social/SocialDiscoverScreen";

export default function DescubrirScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SocialDiscoverScreen showBack title="Descubrir atletas" />
    </>
  );
}
