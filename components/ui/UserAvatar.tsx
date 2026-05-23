import { useEffect, useMemo, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { resolveMediaUrl } from "../../api/config";
import { AUTH } from "../../constants/authUi";

type UserAvatarProps = {
  src?: string | null;
  username: string;
  size?: number;
};

function AvatarSilhouette({ size }: { size: number }) {
  const iconSize = Math.round(size * 0.52);
  return (
    <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        fill={AUTH.gold}
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </Svg>
  );
}

export function UserAvatar({ src, username, size = 46 }: UserAvatarProps) {
  const [loadFailed, setLoadFailed] = useState(false);
  const uri = useMemo(() => {
    const raw = src?.trim() ?? "";
    if (!raw) return "";
    return resolveMediaUrl(raw);
  }, [src]);

  useEffect(() => {
    setLoadFailed(false);
  }, [uri]);

  const initial = (username.trim()[0] ?? "?").toUpperCase();
  const fontSize = Math.max(12, Math.round(size * 0.38));
  const showImage = uri.length > 0 && !loadFailed;

  return (
    <View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          flexShrink: 0,
        },
      ]}
      accessibilityLabel={`Avatar de ${username}`}
    >
      {showImage ? (
        <Image
          source={{ uri }}
          style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2 }}
          onError={() => setLoadFailed(true)}
        />
      ) : initial && initial !== "?" ? (
        <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
      ) : (
        <AvatarSilhouette size={size} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(23, 23, 23, 0.95)",
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.45)",
    overflow: "hidden",
  },
  initial: {
    color: AUTH.gold,
    fontWeight: "700",
  },
});
