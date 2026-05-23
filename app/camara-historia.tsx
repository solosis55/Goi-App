import { CameraView, useCameraPermissions, type CameraType } from "expo-camera";
import { Redirect, useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createStory } from "../api/stories";
import { ApiError } from "../api/client";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../constants/authUi";
import { useAuth } from "../context/AuthContext";
import { pickStoryPhotoFromLibrary } from "../utils/storyCapture";
import { uriToStoryDataUrl } from "../utils/storyImage";

type Phase = "camera" | "preview";

export default function CamaraHistoriaScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const { isHydrated, isAuthenticated } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [phase, setPhase] = useState<Phase>("camera");
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => {
    router.back();
  }, [router]);

  const openGallery = useCallback(async () => {
    setError(null);
    const result = await pickStoryPhotoFromLibrary();
    if (result.ok) {
      setPreviewUri(result.uri);
      setPhase("preview");
      return;
    }
    if (!result.ok && "error" in result) {
      setError(result.error);
    }
  }, []);

  const capture = useCallback(async () => {
    if (!cameraRef.current || !cameraReady || capturing) return;
    setCapturing(true);
    setError(null);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        setPreviewUri(photo.uri);
        setPhase("preview");
      }
    } catch {
      setError("No se pudo tomar la foto.");
    } finally {
      setCapturing(false);
    }
  }, [cameraReady, capturing]);

  const retake = useCallback(() => {
    setPreviewUri(null);
    setPhase("camera");
    setCameraReady(false);
    setError(null);
  }, []);

  const publish = useCallback(async () => {
    if (!previewUri || publishing) return;
    setPublishing(true);
    setError(null);
    try {
      const dataUrl = await uriToStoryDataUrl(previewUri);
      await createStory([{ type: "image", url: dataUrl }]);
      router.replace("/(tabs)");
      if (Platform.OS !== "web") {
        Alert.alert("Goi", "Historia publicada. Visible unas 24 horas.");
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo publicar la historia.";
      setError(msg);
    } finally {
      setPublishing(false);
    }
  }, [previewUri, publishing, router]);

  if (!isHydrated) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (Platform.OS === "web") {
    return (
      <View style={[styles.boot, styles.webFallback]}>
        <Text style={styles.webTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Cámara no disponible en web
        </Text>
        <Text style={styles.webBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Usa la galería para subir una historia.
        </Text>
        <Pressable onPress={() => void openGallery()} style={styles.webBtn}>
          <Text style={styles.webBtnText}>Elegir de galería</Text>
        </Pressable>
        <Pressable onPress={close} style={styles.webCancel}>
          <Text style={styles.webCancelText}>Cerrar</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {phase === "preview" && previewUri ? (
          <>
            <Image source={{ uri: previewUri }} style={styles.webPreview} resizeMode="contain" />
            <Pressable onPress={() => void publish()} disabled={publishing} style={styles.webBtn}>
              {publishing ? <ActivityIndicator color="#000" /> : <Text style={styles.webBtnText}>Publicar</Text>}
            </Pressable>
          </>
        ) : null}
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={AUTH.gold} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.boot, styles.permission]}>
        <Text style={styles.permissionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Permiso de cámara
        </Text>
        <Text style={styles.permissionBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Goi necesita la cámara para grabar tu historia sin salir de la app.
        </Text>
        <Pressable onPress={() => void requestPermission()} style={styles.permissionBtn}>
          <Text style={styles.permissionBtnText}>Continuar</Text>
        </Pressable>
        <Pressable onPress={() => void openGallery()} style={styles.permissionAlt}>
          <Text style={styles.permissionAltText}>Usar galería</Text>
        </Pressable>
        <Pressable onPress={close} style={styles.permissionAlt}>
          <Text style={styles.permissionAltText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  if (phase === "preview" && previewUri) {
    return (
      <View style={styles.root}>
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" accessibilityIgnoresInvertColors />
        <View style={[styles.previewTop, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={retake} hitSlop={12} accessibilityRole="button" accessibilityLabel="Repetir foto">
            <Text style={styles.topAction}>Repetir</Text>
          </Pressable>
          <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar">
            <Text style={styles.closeIcon}>×</Text>
          </Pressable>
        </View>
        <View style={[styles.previewBottom, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {error ? (
            <Text style={styles.errorBanner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {error}
            </Text>
          ) : null}
          <Pressable
            onPress={() => void publish()}
            disabled={publishing}
            style={({ pressed }) => [styles.publishBtn, pressed ? styles.publishPressed : null, publishing ? styles.publishDisabled : null]}
            accessibilityRole="button"
            accessibilityLabel="Publicar historia"
          >
            {publishing ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.publishText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Tu historia
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  const showCamera = isFocused && phase === "camera";

  return (
    <View style={styles.root}>
      {showCamera ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
          mode="picture"
          mirror={facing === "front"}
          onCameraReady={() => setCameraReady(true)}
        />
      ) : (
        <View style={styles.cameraPlaceholder} />
      )}

      <View style={styles.frameOverlay} pointerEvents="none">
        <View style={styles.frameDimTop} />
        <View style={styles.frameRow}>
          <View style={styles.frameDimSide} />
          <View style={styles.frameSquare} />
          <View style={styles.frameDimSide} />
        </View>
        <View style={styles.frameDimBottom} />
      </View>

      <View style={[styles.cameraTop, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={close} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar cámara">
          <Text style={styles.closeIcon}>×</Text>
        </Pressable>
        <Pressable
          onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cambiar cámara"
          style={styles.flipBtn}
        >
          <Text style={styles.flipIcon}>↻</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorFloat}>
          <Text style={styles.errorBanner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {error}
          </Text>
        </View>
      ) : null}

      <View style={[styles.cameraBottom, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <Pressable
          onPress={() => void openGallery()}
          style={styles.galleryBtn}
          accessibilityRole="button"
          accessibilityLabel="Elegir de galería"
        >
          <Text style={styles.galleryIcon}>🖼</Text>
        </Pressable>

        <Pressable
          onPress={() => void capture()}
          disabled={!cameraReady || capturing}
          style={({ pressed }) => [styles.shutterOuter, pressed ? styles.shutterPressed : null, !cameraReady ? styles.shutterDisabled : null]}
          accessibilityRole="button"
          accessibilityLabel="Hacer foto"
        >
          {capturing ? (
            <ActivityIndicator color={AUTH.gold} />
          ) : (
            <View style={styles.shutterInner} />
          )}
        </Pressable>

        <View style={styles.gallerySpacer} />
      </View>
    </View>
  );
}

const FRAME_BORDER = "rgba(255,255,255,0.55)";

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#000",
  },
  boot: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  frameDimTop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  frameRow: {
    flexDirection: "row",
    aspectRatio: 1,
    width: "100%",
    maxHeight: "100%",
  },
  frameDimSide: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  frameSquare: {
    aspectRatio: 1,
    height: "100%",
    borderWidth: 2,
    borderColor: FRAME_BORDER,
  },
  frameDimBottom: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  cameraTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeIcon: {
    color: "#fff",
    fontSize: 36,
    lineHeight: 38,
    fontWeight: "300",
  },
  flipBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  flipIcon: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
  },
  cameraBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    zIndex: 10,
  },
  galleryBtn: {
    width: 48,
    height: 48,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  galleryIcon: {
    fontSize: 22,
  },
  gallerySpacer: {
    width: 48,
  },
  shutterOuter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#fff",
  },
  shutterPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  previewTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    zIndex: 10,
  },
  topAction: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textShadowColor: "rgba(0,0,0,0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  previewBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  publishBtn: {
    borderRadius: 999,
    backgroundColor: AUTH.gold,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  publishPressed: {
    opacity: 0.9,
  },
  publishDisabled: {
    opacity: 0.6,
  },
  publishText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },
  errorFloat: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 140,
    zIndex: 12,
  },
  errorBanner: {
    color: "#fecaca",
    fontSize: 13,
    textAlign: "center",
    backgroundColor: "rgba(127,29,29,0.75)",
    padding: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  error: {
    color: AUTH.danger,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  permission: {
    padding: 24,
    gap: 12,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  permissionBody: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  permissionBtn: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: AUTH.gold,
    paddingVertical: 14,
    alignItems: "center",
  },
  permissionBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  permissionAlt: {
    paddingVertical: 12,
    alignItems: "center",
  },
  permissionAltText: {
    color: "#d4d4d4",
    fontSize: 15,
  },
  webFallback: {
    padding: 24,
    gap: 12,
  },
  webTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  webBody: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
  },
  webBtn: {
    borderRadius: 12,
    backgroundColor: AUTH.gold,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    minWidth: 200,
  },
  webBtnText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 15,
  },
  webCancel: {
    padding: 8,
  },
  webCancelText: {
    color: AUTH.muted,
    fontSize: 14,
  },
  webPreview: {
    width: "100%",
    height: 280,
    borderRadius: 12,
  },
});
