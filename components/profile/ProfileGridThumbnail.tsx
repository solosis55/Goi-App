import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { withMediaCacheBuster } from "../../utils/mediaCacheBuster";

type ProfileGridThumbnailProps = {
  postId: string;
  uri: string;
  remountKey: number;
  /** Mientras el detalle está abierto, no montar Image (misma URI en el modal). */
  hidden?: boolean;
};

export function ProfileGridThumbnail({ postId, uri, remountKey, hidden }: ProfileGridThumbnailProps) {
  const [errorBust, setErrorBust] = useState(0);
  const bustToken = remountKey + errorBust;
  const displayUri = withMediaCacheBuster(uri, bustToken);

  useEffect(() => {
    setErrorBust(0);
  }, [remountKey, uri]);

  if (hidden) {
    return <View style={styles.hidden} accessibilityElementsHidden />;
  }

  return (
    <Image
      key={`${postId}-${bustToken}`}
      source={displayUri}
      style={styles.image}
      contentFit="cover"
      cachePolicy={Platform.OS === "android" ? "memory-disk" : "memory-disk"}
      recyclingKey={`profile-grid-${postId}-${bustToken}`}
      transition={0}
      onError={() => setErrorBust((n) => n + 1)}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  hidden: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(23, 23, 23, 0.95)",
  },
});
