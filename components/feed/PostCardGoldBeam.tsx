import { useEffect, useId, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { useAnimatedProps, useDerivedValue, useSharedValue } from "react-native-reanimated";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
import { AUTH } from "../../constants/authUi";
import { useFeedGoldBeam } from "../../context/FeedGoldBeamContext";
import {
  postCardGoldBeamGlowLength,
  postCardGoldBeamPath,
  postCardGoldBeamPathLength,
} from "../../utils/postCardGoldBeamPath";
import { postCardGoldBeamTravelPx } from "../../utils/postCardGoldBeamScrollProgress";
import {
  beamDashFromProgress,
  beamProgressFromScrollDelta,
} from "../../utils/postCardGoldBeamWorklet";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BEAM_GRADIENT_STOPS = [
  { offset: "0%", opacity: 0 },
  { offset: "10%", opacity: 0.025 },
  { offset: "24%", opacity: 0.08 },
  { offset: "40%", opacity: 0.14 },
  { offset: "50%", opacity: 0.17 },
  { offset: "60%", opacity: 0.12 },
  { offset: "76%", opacity: 0.055 },
  { offset: "90%", opacity: 0.018 },
  { offset: "100%", opacity: 0 },
] as const;

const STROKE_CORE = 1;
const STROKE_HALO_OUTER = 4.5;
const STROKE_HALO_WIDE = 8;
const HALO_WIDE_OPACITY = 0.028;
const HALO_OUTER_OPACITY = 0.038;
const CORE_GOLD = AUTH.gold;

type PostCardGoldBeamProps = {
  width: number;
  height: number;
};

export function PostCardGoldBeam({ width, height }: PostCardGoldBeamProps) {
  const feedBeam = useFeedGoldBeam();
  const gradId = useId().replace(/:/g, "");
  const { height: winHeight } = useWindowDimensions();

  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  const pathD = useMemo(() => postCardGoldBeamPath(w, h), [w, h]);
  const pathLen = useMemo(() => postCardGoldBeamPathLength(w, h), [w, h]);
  const fullGlowLen = useMemo(() => postCardGoldBeamGlowLength(w, h), [w, h]);
  const travelPx = useMemo(() => postCardGoldBeamTravelPx(winHeight, h), [winHeight, h]);

  const grad = useMemo(() => {
    const { x0, y0, iw } = { x0: 1.5, y0: 1.5, iw: w - 3 };
    return { x1: x0, y1: y0, x2: x0 + iw, y2: y0 };
  }, [w]);

  const anchorScrollY = useSharedValue(0);

  useEffect(() => {
    if (feedBeam) {
      anchorScrollY.value = feedBeam.scrollY.value;
    }
  }, [feedBeam, w, h, anchorScrollY]);

  const dashState = useDerivedValue(() => {
    if (!feedBeam) {
      return { dash1: 0, dash2: pathLen, dashOffset: 0, opacity: 0 };
    }
    const delta = feedBeam.scrollY.value - anchorScrollY.value;
    const progress = beamProgressFromScrollDelta(delta, travelPx);
    return beamDashFromProgress(progress, pathLen, fullGlowLen);
  }, [feedBeam, pathLen, fullGlowLen, travelPx]);

  const haloWideProps = useAnimatedProps(() => {
    const { dash1, dash2, dashOffset, opacity } = dashState.value;
    return {
      strokeDasharray: [dash1, dash2],
      strokeDashoffset: dashOffset,
      opacity: opacity * HALO_WIDE_OPACITY,
    };
  });

  const haloOuterProps = useAnimatedProps(() => {
    const { dash1, dash2, dashOffset, opacity } = dashState.value;
    return {
      strokeDasharray: [dash1, dash2],
      strokeDashoffset: dashOffset,
      opacity: opacity * HALO_OUTER_OPACITY,
    };
  });

  const coreProps = useAnimatedProps(() => {
    const { dash1, dash2, dashOffset, opacity } = dashState.value;
    return {
      strokeDasharray: [dash1, dash2],
      strokeDashoffset: dashOffset,
      opacity,
    };
  });

  if (w < 48 || h < 48) return null;

  const cap = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <View style={styles.layer} pointerEvents="none" collapsable={false}>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1={grad.x1}
            y1={grad.y1}
            x2={grad.x2}
            y2={grad.y2}
          >
            {BEAM_GRADIENT_STOPS.map((s) => (
              <Stop key={s.offset} offset={s.offset} stopColor={CORE_GOLD} stopOpacity={s.opacity} />
            ))}
          </LinearGradient>
        </Defs>
        <G>
          <AnimatedPath
            d={pathD}
            stroke={CORE_GOLD}
            strokeWidth={STROKE_HALO_WIDE}
            fill="none"
            animatedProps={haloWideProps}
            {...cap}
          />
          <AnimatedPath
            d={pathD}
            stroke={CORE_GOLD}
            strokeWidth={STROKE_HALO_OUTER}
            fill="none"
            animatedProps={haloOuterProps}
            {...cap}
          />
          <AnimatedPath
            d={pathD}
            stroke={`url(#${gradId})`}
            strokeWidth={STROKE_CORE}
            fill="none"
            animatedProps={coreProps}
            {...cap}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    elevation: 50,
  },
});
