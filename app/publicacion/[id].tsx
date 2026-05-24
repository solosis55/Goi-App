import { Redirect, Stack, useLocalSearchParams } from "expo-router";
import { ProfilePostDetailScreen } from "../../components/profile/ProfilePostDetailScreen";
import { APP_PROFILE_POST_STACK_OPTIONS } from "../../constants/authUi";

export default function PublicacionDetailRoute() {
  const { id, own } = useLocalSearchParams<{ id: string; own?: string }>();
  const postId = typeof id === "string" ? id.trim() : "";

  if (!postId) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <>
      <Stack.Screen options={{ ...APP_PROFILE_POST_STACK_OPTIONS, headerShown: false }} />
      <ProfilePostDetailScreen postId={postId} ownProfile={own === "1"} />
    </>
  );
}
