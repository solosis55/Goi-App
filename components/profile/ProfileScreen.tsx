import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { updateProfile } from "../../api/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { DEFAULT_PROFILE_SECTION_TAB, type ProfileSectionTab } from "../../constants/profileTabs";
import { camaraHistoriaHref } from "../../constants/storyRoutes";
import { useAuth } from "../../context/AuthContext";
import type { FeedStoryAuthor } from "../../types/story";
import { StoryViewerModal } from "../stories/StoryViewerModal";
import { useProfileEditor } from "../../hooks/useProfileEditor";
import { useProfileStats } from "../../hooks/useProfileStats";
import { ProfileEditSection } from "./ProfileEditSection";
import { ProfileHero } from "./ProfileHero";
import { ProfilePostsSection } from "./ProfilePostsSection";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileStatsRow } from "./ProfileStatsRow";
import { ProfileTabBar } from "./ProfileTabBar";
import { ProfilePreviewModal } from "./ProfilePreviewModal";
import { ProfileWorkoutsSummary } from "./ProfileWorkoutsSummary";
import { ProfileStoriesHighlights } from "./ProfileStoriesHighlights";
import { ProfileAccountSwitcherSheet } from "./ProfileAccountSwitcherSheet";
import { shareProfile } from "../../utils/shareProfile";

const PAD = 16;
const STICKY_TAB_INDEX = 2;

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, storedAccounts, switchAccount, updateSessionUser } = useAuth();
  const editor = useProfileEditor();
  const stats = useProfileStats(editor.user?.id);
  const [activeTab, setActiveTab] = useState<ProfileSectionTab>(DEFAULT_PROFILE_SECTION_TAB);
  const [postsTotal, setPostsTotal] = useState<number | null>(null);
  const [postsRefreshing, setPostsRefreshing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyAuthor, setStoryAuthor] = useState<FeedStoryAuthor | null>(null);
  const [storySeenRevision, setStorySeenRevision] = useState(0);
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const [switchingUserId, setSwitchingUserId] = useState<string | null>(null);
  const postsRefreshRef = useRef<(() => Promise<void>) | null>(null);

  const handleSelectAccount = useCallback(
    async (userId: string) => {
      if (userId === user?.id) {
        setAccountSwitcherOpen(false);
        return;
      }
      setSwitchingUserId(userId);
      const ok = await switchAccount(userId);
      setSwitchingUserId(null);
      if (ok) {
        setAccountSwitcherOpen(false);
        router.replace("/(tabs)/perfil");
      }
    },
    [router, switchAccount, user?.id]
  );

  const handleAddAccount = useCallback(() => {
    router.push({ pathname: "/login", params: { addAccount: "1" } });
  }, [router]);

  const storyViewerAuthors = useMemo(
    () => (storyAuthor && storyAuthor.slides.length > 0 ? [storyAuthor] : []),
    [storyAuthor]
  );

  const canSave = editor.isDirty && !editor.restricted && !editor.busy;
  const showSaveInHeader = activeTab === "profile";

  const handleSetPinned = useCallback(
    async (postId: string | null) => {
      if (!editor.user?.id) return;
      const res = await updateProfile(editor.user.id, { pinnedPostId: postId });
      await updateSessionUser(res.user);
      void editor.loadProfile();
    },
    [editor, updateSessionUser]
  );

  const handleTabChange = useCallback(
    (tab: ProfileSectionTab) => {
      if (activeTab === "profile" && tab !== "profile" && editor.isDirty) {
        const apply = () => setActiveTab(tab);
        if (Platform.OS === "web") {
          if (typeof globalThis.confirm === "function" && globalThis.confirm("Tienes cambios sin guardar. ¿Descartarlos?")) {
            apply();
          }
          return;
        }
        Alert.alert("Cambios sin guardar", "Si sales ahora perderás los cambios del formulario.", [
          { text: "Seguir editando", style: "cancel" },
          { text: "Descartar", style: "destructive", onPress: apply },
        ]);
        return;
      }
      setActiveTab(tab);
    },
    [activeTab, editor.isDirty]
  );

  const onPostsRefresh = useCallback(async () => {
    setPostsRefreshing(true);
    try {
      await postsRefreshRef.current?.();
      await stats.refresh();
    } finally {
      setPostsRefreshing(false);
    }
  }, [stats]);

  if (editor.loading && !editor.form) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerSide} />
          <Text style={styles.headerTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Mi perfil
          </Text>
          <View style={styles.headerSide} />
        </View>
        <ProfileSkeleton />
      </View>
    );
  }

  if (editor.loadError && !editor.form) {
    return (
      <View style={[styles.root, styles.centered]}>
        <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {editor.loadError}
        </Text>
        <Pressable onPress={() => void editor.loadProfile()} style={styles.retryBtn}>
          <Text style={styles.retryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Reintentar
          </Text>
        </Pressable>
      </View>
    );
  }

  if (!editor.form || !editor.profile) return null;

  const form = editor.form;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerSide} />
        <Pressable
          onPress={() => setAccountSwitcherOpen(true)}
          style={({ pressed }) => [styles.headerCenter, pressed ? styles.headerCenterPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Cambiar o añadir cuenta"
          accessibilityHint="Abre el selector de cuentas guardadas en este dispositivo"
        >
          <Text style={styles.headerTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Mi perfil
          </Text>
          <Text style={styles.headerChevron} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            ▼
          </Text>
          {form.username ? (
            <Text style={styles.headerSubtitle} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{form.username}
            </Text>
          ) : null}
        </Pressable>
        {showSaveInHeader ? (
          <Pressable
            onPress={() => void editor.onSave()}
            disabled={!canSave}
            hitSlop={10}
            style={styles.headerSide}
            accessibilityRole="button"
            accessibilityLabel="Guardar perfil"
          >
            {editor.saving ? (
              <ActivityIndicator color={AUTH.gold} size="small" />
            ) : (
              <Text
              style={[styles.saveHeaderText, !canSave ? styles.saveHeaderDisabled : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {editor.isDirty ? "Guardar •" : "Guardar"}
            </Text>
            )}
          </Pressable>
        ) : (
          <View style={styles.headerSide} />
        )}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={activeTab === "profile" && Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 56 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[STICKY_TAB_INDEX]}
          refreshControl={
            activeTab === "posts" ? (
              <RefreshControl
                refreshing={postsRefreshing}
                onRefresh={() => void onPostsRefresh()}
                tintColor={AUTH.gold}
                colors={[AUTH.gold]}
              />
            ) : undefined
          }
        >
          <ProfileHero
            username={form.username}
            email={editor.profile.email}
            goal={form.goal}
            avatarUrl={editor.profile.avatarUrl}
            bannerUrl={editor.profile.bannerUrl}
            restricted={editor.restricted}
            uploadingAvatar={editor.uploadingAvatar}
            uploadingBanner={editor.uploadingBanner}
            disabled={editor.busy}
            onChangeAvatar={editor.changeAvatar}
            onChangeBanner={editor.changeBanner}
            onPreview={() => setPreviewOpen(true)}
            onShare={() => {
              if (editor.user?.id) void shareProfile(form.username, editor.user.id);
            }}
          />

          {editor.user?.id ? (
            <ProfileStoriesHighlights
              key={storySeenRevision}
              userId={editor.user.id}
              username={form.username}
              avatarUrl={editor.profile.avatarUrl}
              isSelf
              onViewStory={(author) => {
                setStoryAuthor(author);
                setStoryViewerOpen(true);
              }}
              onCreateStory={() => router.push(camaraHistoriaHref())}
            />
          ) : null}

          <ProfileStatsRow
            postsCount={postsTotal}
            followersCount={stats.followersCount}
            followingCount={stats.followingCount}
            routinesCount={stats.routinesCount}
            loading={stats.loading && stats.followersCount === null}
          />

          <ProfileTabBar active={activeTab} onChange={handleTabChange} />

          {activeTab === "posts" ? (
            <ProfilePostsSection
              userId={editor.user?.id}
              pinnedPostId={editor.profile.pinnedPostId}
              onSetPinned={handleSetPinned}
              onBindRefresh={(fn) => {
                postsRefreshRef.current = fn;
              }}
              onPostsTotalChange={setPostsTotal}
            />
          ) : null}

          {activeTab === "profile" ? (
            <ProfileEditSection editor={editor} userId={editor.user?.id} />
          ) : null}

          {activeTab === "workouts" ? <ProfileWorkoutsSummary goal={form.goal} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <ProfilePreviewModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        username={form.username}
        bio={form.bio}
        goal={form.goal}
        location={form.location}
        avatarUrl={editor.profile.avatarUrl}
        bannerUrl={editor.profile.bannerUrl}
      />

      <StoryViewerModal
        visible={storyViewerOpen}
        authors={storyViewerAuthors}
        startAuthorIdx={0}
        startSlideIdx={0}
        onClose={() => setStoryViewerOpen(false)}
        onStoriesUiRefresh={() => setStorySeenRevision((n) => n + 1)}
      />

      <ProfileAccountSwitcherSheet
        visible={accountSwitcherOpen}
        accounts={storedAccounts}
        activeUserId={user?.id ?? null}
        switchingUserId={switchingUserId}
        onClose={() => setAccountSwitcherOpen(false)}
        onSelectAccount={(id) => void handleSelectAccount(id)}
        onAddAccount={handleAddAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: PAD,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: PAD,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  headerSide: {
    minWidth: 72,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 1,
  },
  headerCenterPressed: {
    opacity: 0.88,
  },
  headerTitle: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "600",
  },
  headerChevron: {
    color: AUTH.gold,
    fontSize: 10,
    marginTop: -2,
  },
  headerSubtitle: {
    color: AUTH.muted,
    fontSize: 12,
    maxWidth: "90%",
  },
  saveHeaderText: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "600",
  },
  saveHeaderDisabled: {
    color: AUTH.faint,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  retryText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
});
