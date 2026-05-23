import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../constants/authUi";

const toastRef: { current: ((message: string) => void) | null } = { current: null };

type GoiToastContextValue = {
  showToast: (message: string) => void;
};

const GoiToastContext = createContext<GoiToastContextValue | null>(null);

const TOAST_MS = 2800;

export function GoiToastProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    const trimmed = msg.trim();
    if (!trimmed) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(trimmed);
    timerRef.current = setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, TOAST_MS);
  }, []);

  useEffect(() => {
    toastRef.current = showToast;
    return () => {
      toastRef.current = null;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <GoiToastContext.Provider value={value}>
      {children}
      {message ? (
        <View style={[styles.host, { bottom: insets.bottom + 72 }]} pointerEvents="none">
          <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOutDown.duration(180)} style={styles.toast}>
            <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {message}
            </Text>
          </Animated.View>
        </View>
      ) : null}
    </GoiToastContext.Provider>
  );
}

export function useGoiToast(): GoiToastContextValue {
  const ctx = useContext(GoiToastContext);
  if (!ctx) throw new Error("useGoiToast debe usarse dentro de GoiToastProvider");
  return ctx;
}

export function goiToast(message: string): void {
  toastRef.current?.(message);
}

const styles = StyleSheet.create({
  host: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 200,
  },
  toast: {
    maxWidth: 420,
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(18, 18, 20, 0.96)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  text: {
    color: AUTH.neutral100,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
