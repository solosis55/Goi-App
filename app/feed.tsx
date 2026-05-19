import { Box, HStack, Text, VStack } from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, Stack, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { getPosts } from "../api/posts";
import { resolveMediaUrl } from "../api/config";
import { ApiError } from "../api/client";
import { useGoiTheme } from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import type { Post } from "../types/post";

function HeaderLogout() {
  const router = useRouter();
  const { signOut, biometricUnlockActive, disableBiometricUnlock } = useAuth();
  const { palette, typography } = useGoiTheme();

  const onLogout = useCallback(() => {
    const run = async () => {
      await signOut();
      router.replace("/");
    };

    if (Platform.OS === "web") {
      if (typeof globalThis.confirm === "function" && globalThis.confirm("¿Cerrar sesión?")) {
        void run();
      }
      return;
    }

    Alert.alert("Goi", "¿Cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: () => void run() },
    ]);
  }, [router, signOut]);

  return (
    <HStack alignItems="center" space="sm">
      {biometricUnlockActive && Platform.OS !== "web" ? (
        <Pressable
          onPress={() => void disableBiometricUnlock()}
          hitSlop={8}
          style={{ paddingHorizontal: 8, paddingVertical: 8 }}
        >
          <Text style={{ color: palette.primary, fontSize: typography.fontSize.sm }}>Biometría</Text>
        </Pressable>
      ) : null}
      <Pressable onPress={onLogout} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
        <Text style={{ color: palette.danger, fontSize: typography.fontSize.sm }}>Salir</Text>
      </Pressable>
    </HStack>
  );
}

function PostCard({
  post,
  palette,
  typography,
}: {
  post: Post;
  palette: ReturnType<typeof useGoiTheme>["palette"];
  typography: ReturnType<typeof useGoiTheme>["typography"];
}) {
  const avatarUri = resolveMediaUrl(post.authorAvatarUrl);
  const firstImage = post.media?.[0]?.url;

  return (
    <Box
      marginBottom="$4"
      padding="$4"
      borderRadius={12}
      borderWidth={1}
      borderColor={palette.border}
      style={{ backgroundColor: palette.surface }}
    >
      <HStack space="md" marginBottom="$2">
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <Box width={40} height={40} borderRadius={20} style={{ backgroundColor: palette.surfaceMuted }} />
        )}
        <VStack flex={1} space="xs">
          <Text style={{ color: palette.text, fontWeight: typography.fontWeight.semibold, fontSize: typography.fontSize.md }}>
            {post.authorUsername}
          </Text>
          <Text style={{ color: palette.textMuted, fontSize: typography.fontSize.xs }}>{post.createdAt.slice(0, 16)}</Text>
        </VStack>
      </HStack>
      {post.content ? (
        <Text style={{ color: palette.text, fontSize: typography.fontSize.md, marginBottom: firstImage ? 12 : 0 }}>
          {post.content}
        </Text>
      ) : null}
      {firstImage ? (
        <Image
          source={{ uri: resolveMediaUrl(firstImage) }}
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}
      <Text style={{ color: palette.textMuted, fontSize: typography.fontSize.sm, marginTop: 8 }}>
        {post.likesCount} me gusta · {post.comments.length} comentarios
      </Text>
    </Box>
  );
}

export default function FeedScreen() {
  const router = useRouter();
  const { palette, typography } = useGoiTheme();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const feedFocusCountRef = useRef(0);

  const fetchPosts = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (e) {
      if (e instanceof ApiError) {
        setError({
          message: e.message,
          detail: `Código ${e.code} · HTTP ${e.status}`,
        });
      } else {
        setError({ message: "No se pudo cargar el feed." });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isHydrated || !isAuthenticated) return;
      feedFocusCountRef.current += 1;
      const mode = feedFocusCountRef.current === 1 ? "initial" : "refresh";
      void fetchPosts(mode);
    }, [isHydrated, isAuthenticated, fetchPosts])
  );

  if (!isHydrated) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" style={{ backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.primary} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const listHeader = (
    <VStack space="md" paddingBottom="$4">
      <Text
        style={{
          color: palette.text,
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
        }}
      >
        Hola, {user?.username ?? "—"}
      </Text>
      <Pressable onPress={() => router.push("/nueva-publicacion")}>
        <Text style={{ color: palette.primary, fontSize: typography.fontSize.md }}>Nueva publicación</Text>
      </Pressable>
      {error ? (
        <VStack space="sm">
          <Text style={{ color: palette.danger, fontSize: typography.fontSize.sm }}>{error.message}</Text>
          {error.detail ? (
            <Text style={{ color: palette.textMuted, fontSize: typography.fontSize.xs }}>{error.detail}</Text>
          ) : null}
          <Pressable onPress={() => void fetchPosts("initial")}>
            <Text style={{ color: palette.primary, fontSize: typography.fontSize.sm }}>Reintentar</Text>
          </Pressable>
        </VStack>
      ) : null}
      {loading && posts.length === 0 ? (
        <ActivityIndicator color={palette.primary} style={{ marginVertical: 16 }} />
      ) : null}
    </VStack>
  );

  const listEmpty =
    !loading && !error && posts.length === 0 ? (
      <VStack space="md" alignItems="center" marginTop={24} paddingHorizontal={16}>
        <Text
          style={{
            color: palette.text,
            fontSize: typography.fontSize.md,
            fontWeight: typography.fontWeight.semibold,
            textAlign: "center",
          }}
        >
          Aún no hay publicaciones
        </Text>
        <Text
          style={{
            color: palette.textMuted,
            fontSize: typography.fontSize.sm,
            textAlign: "center",
            lineHeight: typography.fontSize.sm * 1.45,
          }}
        >
          Cuando publiques o haya actividad en la API, aparecerán aquí. También puedes tirar hacia abajo para
          actualizar.
        </Text>
        <Pressable
          onPress={() => router.push("/nueva-publicacion")}
          style={{
            marginTop: 4,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: palette.primary,
          }}
        >
          <Text style={{ color: palette.primaryForeground, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
            Crear publicación
          </Text>
        </Pressable>
      </VStack>
    ) : null;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Feed",
          headerShown: true,
          headerStyle: { backgroundColor: palette.surface },
          headerTintColor: palette.text,
          headerRight: () => <HeaderLogout />,
        }}
      />
      <Box flex={1} style={{ backgroundColor: palette.background }}>
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} palette={palette} typography={typography} />}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={listEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void fetchPosts("refresh")}
              tintColor={palette.primary}
            />
          }
        />
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 4,
  },
});
