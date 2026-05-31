import { useCallback, useRef } from "react";
import {
  Pressable,
  type PressableProps,
  type GestureResponderEvent,
} from "react-native";
import { useScrollInteractionGuard } from "../../context/ScrollInteractionGuard";

/** Máximo desplazamiento del dedo para contar como tap (no scroll). */
const TAP_SLOP_PX = 14;

type TapSlopPressableProps = PressableProps & {
  onPress: () => void;
};

/**
 * Pressable con tap slop + scroll guard. Usar vía `ScrollAwarePressable` (`scrollGuarded`)
 * solo en detalle de post dentro de `GuardedScrollView` — no en feed ni grids de perfil.
 */
export function TapSlopPressable({
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: TapSlopPressableProps) {
  const scrollGuard = useScrollInteractionGuard();
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const handlePressIn = useCallback(
    (event: GestureResponderEvent) => {
      startRef.current = {
        x: event.nativeEvent.pageX,
        y: event.nativeEvent.pageY,
      };
      onPressIn?.(event);
    },
    [onPressIn]
  );

  const handlePressOut = useCallback(
    (event: GestureResponderEvent) => {
      const start = startRef.current;
      startRef.current = null;
      onPressOut?.(event);
      if (!start) return;
      if (scrollGuard?.isScrolling()) return;

      const dx = Math.abs(event.nativeEvent.pageX - start.x);
      const dy = Math.abs(event.nativeEvent.pageY - start.y);
      if (dx <= TAP_SLOP_PX && dy <= TAP_SLOP_PX) {
        onPress();
      }
    },
    [onPress, onPressOut]
  );

  return (
    <Pressable
      {...rest}
      onPress={undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    />
  );
}
