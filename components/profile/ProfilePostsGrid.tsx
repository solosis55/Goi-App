import { memo } from "react";
import { StyleSheet, Text, View, useWindowDimensions, Pressable } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { Post } from "../../types/post";
import { postThumbnailUrl } from "../../utils/postThumbnail";
import { ProfileGridThumbnail } from "./ProfileGridThumbnail";

const COLS = 3;
const GAP = 3;
const CELL_RADIUS = 5;

type ProfilePostsGridProps = {
  posts: Post[];
  pinnedPostId?: string | null;
  selectedId?: string | null;
  /** Incrementar al cerrar el detalle para evitar miniaturas en negro (reciclado de Image en Android). */
  thumbRemountKey?: number;
  /** Post cuyo detalle está abierto: no renderizar su miniatura hasta cerrar. */
  openPostId?: string | null;
  workoutLabelByPostId?: Record<string, string>;
  onSelect: (postId: string) => void;
};

type ProfileGridCellProps = {
  post: Post;
  cellSize: number;
  selected: boolean;
  isPinned: boolean;
  multi: boolean;
  thumbUri: string;
  workoutLabel?: string;
  label: string;
  thumbRemountKey: number;
  hidden: boolean;
  onSelect: (postId: string) => void;
};

const ProfileGridCell = memo(function ProfileGridCell({
  post,
  cellSize,
  selected,
  isPinned,
  multi,
  thumbUri,
  workoutLabel,
  label,
  thumbRemountKey,
  hidden,
  onSelect,
}: ProfileGridCellProps) {
  return (
    <Pressable
      onPress={() => onSelect(post.id)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.cell,
        { width: cellSize, height: cellSize, borderRadius: CELL_RADIUS },
        selected ? styles.cellSelected : null,
        pressed ? styles.cellPressed : null,
      ]}
    >
      {thumbUri ? (
        <ProfileGridThumbnail
          postId={post.id}
          uri={thumbUri}
          remountKey={thumbRemountKey}
          hidden={hidden}
        />
      ) : (
        <View style={styles.textOnly}>
          <View style={styles.textOnlyGlow} />
          <Text style={styles.textOnlyBody} numberOfLines={5} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {post.content.trim() || "—"}
          </Text>
        </View>
      )}
      {isPinned ? (
        <View style={styles.badgeTopLeft}>
          <Text style={styles.badgeIcon} accessibilityElementsHidden>
            ★
          </Text>
        </View>
      ) : null}
      {workoutLabel ? (
        <View style={styles.badgeBottom}>
          <Text style={styles.workoutBadgeText} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            🏋 {workoutLabel}
          </Text>
        </View>
      ) : null}
      {multi ? (
        <View style={styles.badgeTopRight}>
          <Text style={styles.badgeIcon} accessibilityElementsHidden>
            ▦
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
});

export function ProfilePostsGrid({
  posts,
  pinnedPostId,
  selectedId,
  thumbRemountKey = 0,
  openPostId,
  workoutLabelByPostId,
  onSelect,
}: ProfilePostsGridProps) {
  const { width } = useWindowDimensions();
  const cellSize = (width - 32 - GAP * (COLS - 1)) / COLS;
  const pinTrim = pinnedPostId?.trim() ?? "";

  return (
    <View style={[styles.grid, { paddingHorizontal: 16 }]}>
      {posts.map((post) => {
        const thumb = postThumbnailUrl(post);
        const thumbUri = thumb ? resolveMediaUrl(thumb) : "";
        const multi = (post.media?.length ?? 0) > 1;
        const selected = selectedId === post.id;
        const isPinned = Boolean(pinTrim && post.id === pinTrim);
        const workoutLabel = workoutLabelByPostId?.[post.id];
        const preview = post.content.trim().slice(0, 80);
        const label =
          preview.length > 0
            ? `Publicación: ${preview}${post.content.trim().length > 80 ? "…" : ""}`
            : "Publicación sin texto";

        return (
          <ProfileGridCell
            key={post.id}
            post={post}
            cellSize={cellSize}
            selected={selected}
            isPinned={isPinned}
            multi={multi}
            thumbUri={thumbUri}
            workoutLabel={workoutLabel}
            label={label}
            thumbRemountKey={thumbRemountKey}
            hidden={openPostId === post.id}
            onSelect={onSelect}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  cell: {
    backgroundColor: "rgba(23, 23, 23, 0.95)",
    overflow: "hidden",
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: AUTH.gold,
  },
  cellPressed: {
    opacity: 0.9,
  },
  textOnly: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 8,
    backgroundColor: "rgba(22, 20, 14, 0.85)",
    overflow: "hidden",
  },
  textOnlyGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(212, 175, 55, 0.06)",
  },
  textOnlyBody: {
    color: AUTH.steel,
    fontSize: 10,
    lineHeight: 14,
    zIndex: 1,
  },
  badgeTopLeft: {
    position: "absolute",
    left: 4,
    top: 4,
  },
  badgeTopRight: {
    position: "absolute",
    right: 4,
    top: 4,
  },
  badgeIcon: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 3,
    paddingHorizontal: 4,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  workoutBadgeText: {
    color: AUTH.gold,
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
});
