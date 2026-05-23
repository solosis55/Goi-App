import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AppScreenShell } from "../../components/AppScreenShell";
import { ProfileScreen } from "../../components/profile/ProfileScreen";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function PerfilTab() {
  const { palette } = useGoiTheme();
  const { isHydrated, isAuthenticated } = useAuth();

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
    <AppScreenShell>
      <ProfileScreen />
    </AppScreenShell>
  );
}
