import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { API_BASE_URL } from "../api/config";
import { AuthTopGlow } from "../components/AuthTopGlow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../constants/authUi";
import { INDEX_START_HINT_SEEN_KEY } from "../constants/storageKeys";
import { useAuth } from "../context/AuthContext";

const LOGO_MARK = require("../assets/branding/goi-logo-mark.png");

const HERO_RING = 148;
/** Espacio para anillos de halo alrededor del logo. */
const LOGO_STAGE = 236;
const HERO_ENTER_MS = 520;
const BREATH_IN_MS = 2600;
const BREATH_OUT_MS = 2800;
const HALO_PULSE_MS = 4200;

type ApiReach = "checking" | "ok" | "offline";

/**
 * Anillos difusos detrás del logo (contraluz tipo Goi Web, sin SVG/máscaras en Android).
 */
function LogoHaloRings() {
  return (
    <View style={styles.haloRings} pointerEvents="none">
      <View style={[styles.haloRing, styles.haloRingOuter]} />
      <View style={[styles.haloRing, styles.haloRingMid]} />
      <View style={[styles.haloRing, styles.haloRingInner]} />
    </View>
  );
}

/**
 * Inicio (landing): app-first — entrada del bloque logo + halo y respiración suave continua.
 */
export default function InicioScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isHydrated, isAuthenticated } = useAuth();

  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [startHintSeen, setStartHintSeen] = useState<boolean | null>(null);
  const [apiReach, setApiReach] = useState<ApiReach>("checking");

  useEffect(() => {
    if (!isHydrated || isAuthenticated) return;
    let cancelled = false;
    void AsyncStorage.getItem(INDEX_START_HINT_SEEN_KEY).then((v) => {
      if (!cancelled) setStartHintSeen(v === "1");
    });

    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), 4500);
    const healthUrl = `${API_BASE_URL.replace(/\/$/, "")}/health`;
    void fetch(healthUrl, {
      method: "GET",
      signal: ac.signal,
      headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!cancelled) setApiReach(res.ok ? "ok" : "offline");
      })
      .catch(() => {
        if (!cancelled) setApiReach("offline");
      })
      .finally(() => clearTimeout(timeoutId));

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [isHydrated, isAuthenticated]);

  const dismissStartHint = () => {
    void AsyncStorage.setItem(INDEX_START_HINT_SEEN_KEY, "1");
    setStartHintSeen(true);
  };

  const heroEnter = useRef(new Animated.Value(1.08)).current;
  const logoBreath = useRef(new Animated.Value(1)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;
  const enterAnimRef = useRef<Animated.CompositeAnimation | null>(null);
  const breathLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const haloPulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const logoScale = Animated.multiply(heroEnter, logoBreath);
  const haloPulseOpacity = haloPulse.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.48, 0.72, 0.48],
  });

  const triggerHaptic = () => {
    try {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* Expo Web / sin módulo nativo */
    }
  };

  const goLogin = () => {
    triggerHaptic();
    router.push("/login");
  };

  useLayoutEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    router.replace("/feed");
  }, [isHydrated, isAuthenticated, router]);

  useLayoutEffect(() => {
    if (!isHydrated || isAuthenticated) return;

    let cancelled = false;

    const run = async () => {
      const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
      if (cancelled) return;
      setReduceMotionEnabled(reduceMotion);

      if (reduceMotion) {
        heroEnter.setValue(1);
        logoBreath.setValue(1);
        return;
      }

      const startBreathAndHalo = () => {
        if (cancelled) return;
        const breath = Animated.loop(
          Animated.sequence([
            Animated.timing(logoBreath, {
              toValue: 1.028,
              duration: BREATH_IN_MS,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(logoBreath, {
              toValue: 1,
              duration: BREATH_OUT_MS,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        );
        breathLoopRef.current = breath;
        breath.start();

        const haloLoop = Animated.loop(
          Animated.sequence([
            Animated.timing(haloPulse, {
              toValue: 1,
              duration: HALO_PULSE_MS / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(haloPulse, {
              toValue: 0,
              duration: HALO_PULSE_MS / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ])
        );
        haloPulseLoopRef.current = haloLoop;
        haloLoop.start();
      };

      const enter = Animated.timing(heroEnter, {
        toValue: 1,
        duration: HERO_ENTER_MS,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      });
      enterAnimRef.current = enter;
      enter.start(({ finished }) => {
        if (finished && !cancelled) startBreathAndHalo();
      });
    };

    void run();

    return () => {
      cancelled = true;
      enterAnimRef.current?.stop?.();
      enterAnimRef.current = null;
      breathLoopRef.current?.stop();
      breathLoopRef.current = null;
      haloPulseLoopRef.current?.stop();
      haloPulseLoopRef.current = null;
      heroEnter.stopAnimation();
      logoBreath.stopAnimation();
      haloPulse.stopAnimation();
    };
  }, [haloPulse, heroEnter, logoBreath, isAuthenticated, isHydrated]);

  if (!isHydrated || isAuthenticated) {
    return (
      <View style={[styles.center, { backgroundColor: AUTH.bg }]}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={AUTH.gold} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <AuthTopGlow width={width} windowHeight={height} />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.shell}>
          <View style={styles.heroArea}>
            <View style={styles.apiStatusPill} pointerEvents="none">
              {apiReach === "checking" ? (
                <Text style={styles.apiStatusText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Comprobando…
                </Text>
              ) : (
                <>
                  <View style={[styles.apiDot, apiReach === "ok" ? styles.apiDotOk : styles.apiDotOff]} />
                  <Text style={styles.apiStatusText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {apiReach === "ok" ? "Conectado" : "Sin conexión"}
                  </Text>
                </>
              )}
            </View>
            <View style={styles.heroColumn}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continuar"
                accessibilityHint="Abre la pantalla de acceso, donde puedes iniciar sesión o crear cuenta"
                onPress={goLogin}
                {...(Platform.OS === "android"
                  ? { android_ripple: { color: "rgba(212, 175, 55, 0.22)" } }
                  : {})}
                style={({ pressed }) => [styles.logoHit, pressed ? styles.logoHitPressed : null]}
              >
                <Animated.View style={[styles.logoStage, { transform: [{ scale: logoScale }] }]}>
                  {reduceMotionEnabled ? (
                    <View style={[styles.haloRingsWrap, { opacity: 0.58 }]} pointerEvents="none">
                      <LogoHaloRings />
                    </View>
                  ) : (
                    <Animated.View style={[styles.haloRingsWrap, { opacity: haloPulseOpacity }]} pointerEvents="none">
                      <LogoHaloRings />
                    </Animated.View>
                  )}
                  <View style={styles.logoRing}>
                    <Image
                      source={LOGO_MARK}
                      style={styles.logoImage}
                      resizeMode="cover"
                      accessibilityIgnoresInvertColors
                    />
                  </View>
                </Animated.View>
              </Pressable>

              <Text style={styles.brandWordmark} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                GoI
              </Text>
              <Text style={styles.heroSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Tu red y tus rutinas
              </Text>
              <Text style={styles.heroDescription} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Publicaciones, rutinas y entrenamientos con la misma cuenta que en Goi Web.
              </Text>
            </View>
          </View>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) + 14 }]}>
            {startHintSeen === false ? (
              <View style={styles.firstVisitBanner}>
                <Text style={styles.firstVisitText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Pulsa el logo para ir a la pantalla de acceso. Allí podrás iniciar sesión o crear cuenta.
                </Text>
                <Pressable
                  onPress={dismissStartHint}
                  accessibilityRole="button"
                  accessibilityLabel="Entendido, ocultar este aviso"
                  style={({ pressed }) => [styles.firstVisitCta, pressed ? styles.firstVisitCtaPressed : null]}
                >
                  <Text style={styles.firstVisitCtaLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Entendido
                  </Text>
                </Pressable>
              </View>
            ) : null}
            {startHintSeen === true ? (
              <Text style={styles.heroHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Pulsa el logo para continuar
              </Text>
            ) : null}
            <Text style={styles.trustCaption} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Misma cuenta que en Goi Web
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  shell: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroArea: {
    flex: 1,
    justifyContent: "center",
    minHeight: 0,
    paddingHorizontal: 16,
    paddingTop: 4,
    position: "relative",
  },
  footer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heroColumn: {
    alignItems: "center",
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  logoHit: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 28,
  },
  logoHitPressed: {
    opacity: Platform.OS === "ios" ? 0.9 : 1,
  },
  logoStage: {
    width: LOGO_STAGE,
    height: LOGO_STAGE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  haloRingsWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  haloRings: {
    width: LOGO_STAGE,
    height: LOGO_STAGE,
    alignItems: "center",
    justifyContent: "center",
  },
  haloRing: {
    position: "absolute",
    alignSelf: "center",
  },
  haloRingOuter: {
    width: 224,
    height: 224,
    borderRadius: 112,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.16)",
    backgroundColor: "rgba(212, 175, 55, 0.035)",
  },
  haloRingMid: {
    width: 198,
    height: 198,
    borderRadius: 99,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.12)",
    backgroundColor: "rgba(212, 175, 55, 0.02)",
  },
  haloRingInner: {
    width: 174,
    height: 174,
    borderRadius: 87,
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.18)",
    backgroundColor: "transparent",
  },
  logoRing: {
    width: HERO_RING,
    height: HERO_RING,
    borderRadius: HERO_RING / 2,
    overflow: "hidden",
    backgroundColor: "#0a0a0a",
    borderWidth: 2,
    borderColor: "rgba(212, 175, 55, 0.48)",
    elevation: 0,
    shadowColor: "rgba(212, 175, 55, 0.55)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 22,
    zIndex: 2,
  },
  logoImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1 }],
    opacity: 1,
  },
  brandWordmark: {
    marginTop: 14,
    color: "#b8b4c8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 3.8,
    textTransform: "uppercase",
  },
  heroSubtitle: {
    marginTop: 12,
    textAlign: "center",
    color: "#ececf1",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  heroDescription: {
    marginTop: 12,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 440,
    paddingHorizontal: 4,
  },
  heroHint: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
    color: "#a3a3a3",
    textAlign: "center",
    maxWidth: 360,
  },
  trustCaption: {
    marginTop: 0,
    marginBottom: 2,
    fontSize: 12,
    color: "#737373",
    textAlign: "center",
    maxWidth: 320,
  },
  apiStatusPill: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(10, 10, 12, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.18)",
    maxWidth: "88%",
  },
  apiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  apiDotOk: {
    backgroundColor: "#4ade80",
  },
  apiDotOff: {
    backgroundColor: "#737373",
  },
  apiStatusText: {
    color: "#a3a3a3",
    fontSize: 11,
    fontWeight: "600",
  },
  firstVisitBanner: {
    width: "100%",
    maxWidth: 420,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(8, 8, 10, 0.92)",
  },
  firstVisitText: {
    color: "#e5e5e5",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  firstVisitCta: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  firstVisitCtaPressed: {
    opacity: 0.85,
  },
  firstVisitCtaLabel: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
});
