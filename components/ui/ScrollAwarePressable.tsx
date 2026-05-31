import { Pressable, type PressableProps } from "react-native";
import { TapSlopPressable } from "./TapSlopPressable";

type ScrollAwarePressableProps = PressableProps & {
  /** Activar dentro de `GuardedScrollView` (detalle de post desde perfil). */
  scrollGuarded?: boolean;
  onPress: () => void;
};

/** Feed: `Pressable`. Detalle con scroll guard: `TapSlopPressable`. */
export function ScrollAwarePressable({
  scrollGuarded = false,
  onPress,
  ...rest
}: ScrollAwarePressableProps) {
  if (scrollGuarded) {
    return <TapSlopPressable onPress={onPress} {...rest} />;
  }
  return <Pressable onPress={onPress} {...rest} />;
}
