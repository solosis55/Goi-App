import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";
import { buildTrainingPreviewDraft } from "../../utils/postTrainingPreviewDraft";
import { PostFeedPreviewTraining } from "./preview/PostFeedPreviewTraining";
import type { PostPreviewDraft } from "./preview/postPreviewTypes";

type CreatePostTrainingPreviewSheetProps = {
  visible: boolean;
  onClose: () => void;
  draft: PostPreviewDraft;
  onPressViewSession?: () => void;
};

/** Preview del bloque Training vinculado a una publicación estándar. */
export function CreatePostTrainingPreviewSheet({
  visible,
  onClose,
  draft,
  onPressViewSession,
}: CreatePostTrainingPreviewSheetProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const previewW = Math.min(width - 32, 400);

  const trainingDraft = buildTrainingPreviewDraft(draft);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.headIcon}>
            <TabDumbbellIcon size={20} color={AUTH.gold} filled />
          </View>
          <View style={styles.headText}>
            <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Entreno vinculado
            </Text>
            <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Así se verá la sesión en tu publicación
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.done} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cerrar
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.previewClip, { width: previewW }]}>
            <PostFeedPreviewTraining
              draft={trainingDraft}
              layoutWidth={previewW}
              embedded
              previewMode
              showViewFullCta={Boolean(onPressViewSession)}
              onPressViewSession={onPressViewSession}
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.62)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "88%",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: AUTH.bg,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(212, 175, 55, 0.28)",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: AUTH.fieldBorder,
    marginTop: 10,
    marginBottom: 8,
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
  },
  headText: { flex: 1, gap: 2, paddingTop: 2 },
  title: { color: AUTH.neutral100, fontSize: 16, fontWeight: "700" },
  sub: { color: AUTH.faint, fontSize: 12, lineHeight: 17 },
  done: { color: AUTH.gold, fontSize: 15, fontWeight: "600" },
  scroll: { flexGrow: 0 },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  previewClip: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.55)",
  },
});
