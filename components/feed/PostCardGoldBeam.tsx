import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { StyleSheet, useWindowDimensions, View, type View as RNView } from "react-native";
import Svg, { Defs, G, LinearGradient, Path, Stop } from "react-native-svg";
import { AUTH } from "../../constants/authUi";
import { useFeedGoldBeam } from "../../context/FeedGoldBeamContext";
import { postCardGoldBeamGlowPath } from "../../utils/postCardGoldBeamPath";
import { isCardOnScreen } from "../../utils/postCardGoldBeamProgress";
import { postCardGoldBeamProgressFromScroll } from "../../utils/postCardGoldBeamScrollProgress";
import { measureViewInWindow } from "../../utils/measureInWindow";

/** Brillo sutil: fade largo, pico bajo (alineado con `GoiGoldFadeLine` subtle). */
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
const STROKE_HALO_INNER = 2.5;
const STROKE_HALO_OUTER = 4.5;
const STROKE_HALO_WIDE = 8;
const HALO_WIDE_OPACITY = 0.028;
const HALO_INNER_OPACITY = 0.055;
const HALO_OUTER_OPACITY = 0.038;
const CORE_GOLD = AUTH.gold;
const CORE_WARM = "#f0d878";
const CORE_WARM_OPACITY = 0.1;

type ScrollAnchor = { scrollY: number };

type PostCardGoldBeamProps = {
  hostRef: RefObject<RNView | null>;
  width: number;
  height: number;
};

function BeamGlowPaths({
  glowD,
  gradId,
  grad,
  opacity,
}: {
  glowD: string;
  gradId: string;
  grad: { x1: number; y1: number; x2: number; y2: number };
  opacity: number;
}) {
  const cap = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  return (
    <G opacity={opacity}>
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
      <Path
        d={glowD}
        stroke={CORE_GOLD}
        strokeWidth={STROKE_HALO_WIDE}
        strokeOpacity={HALO_WIDE_OPACITY}
        fill="none"
        {...cap}
      />
      <Path
        d={glowD}
        stroke={CORE_GOLD}
        strokeWidth={STROKE_HALO_OUTER}
        strokeOpacity={HALO_OUTER_OPACITY}
        fill="none"
        {...cap}
      />
      <Path
        d={glowD}
        stroke={CORE_GOLD}
        strokeWidth={STROKE_HALO_INNER}
        strokeOpacity={HALO_INNER_OPACITY}
        fill="none"
        {...cap}
      />
      <Path
        d={glowD}
        stroke={`url(#${gradId})`}
        strokeWidth={STROKE_CORE}
        fill="none"
        {...cap}
      />
      <Path
        d={glowD}
        stroke={CORE_WARM}
        strokeWidth={0.65}
        strokeOpacity={CORE_WARM_OPACITY}
        fill="none"
        {...cap}
      />
    </G>
  );
}

export function PostCardGoldBeam({ hostRef, width, height }: PostCardGoldBeamProps) {
  const feedBeam = useFeedGoldBeam();
  const gradId = useId().replace(/:/g, "");
  const { height: winHeight } = useWindowDimensions();
  const anchorRef = useRef<ScrollAnchor | null>(null);

  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  const [glowD, setGlowD] = useState("");
  const [grad, setGrad] = useState({ x1: 0, y1: 0, x2: 1, y2: 0 });
  const [beamOpacity, setBeamOpacity] = useState(0);
  const [show, setShow] = useState(false);

  const applyProgress = useCallback(
    (progress: number) => {
      const frame = postCardGoldBeamGlowPath(progress, w, h);
      setGlowD(frame.d);
      setGrad({ x1: frame.x1, y1: frame.y1, x2: frame.x2, y2: frame.y2 });
      setBeamOpacity(frame.opacity);
      setShow(frame.opacity > 0.02 && frame.d.length > 0);
    },
    [w, h]
  );

  const resetAnchor = useCallback(
    (contentOffsetY: number) => {
      anchorRef.current = { scrollY: contentOffsetY };
      applyProgress(0);
    },
    [applyProgress]
  );

  const onFeedScroll = useCallback(
    (contentOffsetY: number) => {
      if (!anchorRef.current) {
        resetAnchor(contentOffsetY);
        return;
      }

      const progress = postCardGoldBeamProgressFromScroll(
        contentOffsetY,
        anchorRef.current.scrollY,
        0,
        winHeight,
        h
      );
      applyProgress(progress);
    },
    [resetAnchor, winHeight, h, applyProgress]
  );

  const syncFromScroll = useCallback(() => {
    if (!feedBeam) return;
    const y = feedBeam.scrollY.value;
    if (anchorRef.current === null) {
      resetAnchor(y);
    } else {
      onFeedScroll(y);
    }
  }, [feedBeam, resetAnchor, onFeedScroll]);

  const checkOnScreen = useCallback(() => {
    measureViewInWindow(hostRef.current, (rect) => {
      if (!rect || !isCardOnScreen(rect.y, rect.height, winHeight)) {
        setShow(false);
        return;
      }
      syncFromScroll();
    });
  }, [hostRef, winHeight, syncFromScroll]);

  useEffect(() => {
    if (!feedBeam) return;

    anchorRef.current = null;

    const boot = () => syncFromScroll();
    boot();
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(boot);
    });

    const unregister = feedBeam.registerScrollListener(onFeedScroll);
    const visId = setInterval(checkOnScreen, 500);

    return () => {
      cancelAnimationFrame(frame);
      unregister();
      clearInterval(visId);
    };
  }, [feedBeam, w, h, onFeedScroll, syncFromScroll, checkOnScreen]);

  if (!show || !glowD || w < 48 || h < 48) return null;

  return (
    <View style={styles.layer} pointerEvents="none" collapsable={false}>
      <Svg width={w} height={h}>
        <BeamGlowPaths glowD={glowD} gradId={gradId} grad={grad} opacity={beamOpacity} />
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
