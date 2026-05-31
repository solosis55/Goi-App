import { Redirect, Tabs, usePathname } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { CreateContentSheet } from "../../components/navigation/CreateContentSheet";
import { GoiTabBar } from "../../components/navigation/GoiTabBar";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useSocialBadgePolling } from "../../hooks/useSocialBadgePolling";

export default function TabsLayout() {
  const { palette } = useGoiTheme();
  const { isHydrated, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const socialTabActive = pathname.includes("/social");
  useSocialBadgePolling(isAuthenticated, { fast: socialTabActive });
  const [createOpen, setCreateOpen] = useState(false);

  if (!isHydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Tabs
        tabBar={(props) => <GoiTabBar {...props} onCreatePress={() => setCreateOpen(true)} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Inicio" }} />
        <Tabs.Screen name="entrenamientos" options={{ title: "Entrenamientos" }} />
        <Tabs.Screen
          name="create"
          options={{ title: "Crear" }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setCreateOpen(true);
            },
          }}
        />
        <Tabs.Screen name="social" options={{ title: "Social" }} />
        <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
      </Tabs>
      <CreateContentSheet visible={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
