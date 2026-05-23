import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FeedStoryAuthor } from "../../types/story";
import { markStoryAuthorSeen } from "../../utils/storySeen";
import { UserAvatar } from "../ui/UserAvatar";

const AUTO_ADVANCE_MS = 5600;

type StoryViewerModalProps = {
  visible: boolean;
  authors: FeedStoryAuthor[];
  startAuthorIdx: number;
  startSlideIdx: number;
  onClose: () => void;
  onStoriesUiRefresh: () => void;
};

export function StoryViewerModal({
  visible,
  authors,
  startAuthorIdx,
  startSlideIdx,
  onClose,
  onStoriesUiRefresh,
}: StoryViewerModalProps) {
  const insets = useSafeAreaInsets();
  const [authorIdx, setAuthorIdx] = useState(startAuthorIdx);
  const [slideIdx, setSlideIdx] = useState(startSlideIdx);
  const [holdPaused, setHoldPaused] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;

  const author = authors[authorIdx];
  const slides = author?.slides ?? [];
  const slide = slides[slideIdx];

  useEffect(() => {
    if (!visible) return;
    setAuthorIdx(startAuthorIdx);
    setSlideIdx(startSlideIdx);
    setHoldPaused(false);
    progress.setValue(0);
  }, [visible, startAuthorIdx, startSlideIdx, progress]);

  useEffect(() => {
    setHoldPaused(false);
    progress.setValue(0);
  }, [slideIdx, authorIdx, progress]);

  const finishCurrentAuthor = useCallback(() => {
    if (author?.slides.length) {
      void markStoryAuthorSeen(author.userId, author.slides).then(() => onStoriesUiRefresh());
    }
  }, [author, onStoriesUiRefresh]);

  const advance = useCallback(() => {
    if (!author) {
      onClose();
      return;
    }
    if (slideIdx >= slides.length - 1) {
      finishCurrentAuthor();
      const nextAuthor = authorIdx + 1;
      if (nextAuthor >= authors.length) {
        onClose();
        return;
      }
      setAuthorIdx(nextAuthor);
      setSlideIdx(0);
      return;
    }
    setSlideIdx((s) => s + 1);
  }, [author, authorIdx, authors.length, finishCurrentAuthor, onClose, slideIdx, slides.length]);

  const rewind = useCallback(() => {
    if (slideIdx > 0) {
      setSlideIdx((s) => s - 1);
      return;
    }
    if (authorIdx > 0) {
      const prevAuthor = authors[authorIdx - 1];
      setAuthorIdx(authorIdx - 1);
      setSlideIdx(Math.max(0, prevAuthor.slides.length - 1));
    }
  }, [authorIdx, authors, slideIdx]);

  useEffect(() => {
    if (!visible || !author || slides.length === 0 || !slide || holdPaused) return;

    progress.setValue(0);
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: AUTO_ADVANCE_MS,
      useNativeDriver: false,
    });
    anim.start(({ finished }) => {
      if (finished) advance();
    });
    return () => anim.stop();
  }, [visible, author, slides.length, slide, slideIdx, authorIdx, advance, holdPaused, progress]);

  const handleClose = useCallback(() => {
    if (author && slides.length > 0 && slideIdx >= slides.length - 1) {
      finishCurrentAuthor();
    }
    onClose();
  }, [author, finishCurrentAuthor, onClose, slideIdx, slides.length]);

  const mediaUri = slide ? resolveMediaUrl(slide.mediaUrl) : "";

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={handleClose} statusBarTranslucent>
      <View style={styles.root}>
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
          <Pressable onPress={handleClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar historias">
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
          {author ? (
            <View style={styles.authorRow}>
              <UserAvatar src={author.authorAvatarUrl} username={author.authorUsername} size={32} />
              <Text style={styles.authorName} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{author.authorUsername}
              </Text>
            </View>
          ) : (
            <Text style={styles.muted}>Sin historias</Text>
          )}
        </View>

        <View style={styles.segments}>
          {slides.map((seg, i) => (
            <View key={seg.id} style={styles.segmentTrack}>
              {i < slideIdx ? <View style={styles.segmentFull} /> : null}
              {i === slideIdx ? (
                <Animated.View
                  style={[
                    styles.segmentFull,
                    {
                      width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.mediaArea}>
          {!author || !slide || !mediaUri ? (
            <Text style={styles.muted}>Historia no disponible</Text>
          ) : (
            <>
              <Image source={{ uri: mediaUri }} style={styles.image} resizeMode="contain" accessibilityIgnoresInvertColors />
              <Pressable style={styles.tapLeft} onPress={rewind} accessibilityRole="button" accessibilityLabel="Anterior" />
              <Pressable style={styles.tapRight} onPress={advance} accessibilityRole="button" accessibilityLabel="Siguiente" />
              <Pressable
                style={styles.tapCenter}
                onPressIn={() => setHoldPaused(true)}
                onPressOut={() => setHoldPaused(false)}
                accessibilityLabel="Mantén pulsado para pausar"
              />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  closeIcon: {
    color: "#fff",
    fontSize: 32,
    lineHeight: 34,
    fontWeight: "300",
    width: 40,
    textAlign: "center",
  },
  authorRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },
  authorName: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  muted: {
    color: AUTH.muted,
    fontSize: 14,
  },
  segments: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  segmentTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },
  segmentFull: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  mediaArea: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#000",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  tapLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "33%",
  },
  tapRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "33%",
  },
  tapCenter: {
    position: "absolute",
    left: "33%",
    top: 0,
    bottom: 0,
    width: "34%",
  },
});
