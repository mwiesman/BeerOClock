import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Polygon, ClipPath, Defs } from 'react-native-svg';
import { colors, spacing, fontSize } from '../src/theme';
import { getGlassStyle } from '../src/utils/storage';
import Button from '../src/components/Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STREAM_HEIGHT = SCREEN_HEIGHT * 0.4;
const NUM_BUBBLES = 8;

// Physics tuning
const POUR_TILT_THRESHOLD = 0.4;
const SMOOTHING_FACTOR = 0.82;
const MAX_POUR_RATE = 0.008;
const TILT_TO_ROTATION_DEG = 25;

type ContainerType = 'pint' | 'mug' | 'bottle' | 'can';
const ALL_CONTAINERS: ContainerType[] = ['pint', 'mug', 'bottle', 'can'];

// Container dimensions
const PINT_WIDTH = 140;
const PINT_HEIGHT = 220;
const MUG_WIDTH = 130;
const MUG_HEIGHT = 200;
const MUG_HANDLE_W = 28;
const BTL_BODY_W = 90;
const BTL_BODY_H = 160;
const BTL_NECK_W = 30;
const CAN_W = 100;
const CAN_H = 190;

export default function PourScreen() {
  const router = useRouter();
  const [fillLevel, setFillLevel] = useState(0);
  const [phase, setPhase] = useState<'filling' | 'ready' | 'pouring' | 'done'>('filling');
  const [smoothedTilt, setSmoothedTilt] = useState(0);
  const [container, setContainer] = useState<ContainerType>('pint');
  const smoothedRef = useRef(0);

  useEffect(() => {
    getGlassStyle().then((pref) => {
      if (pref === 'random') {
        setContainer(ALL_CONTAINERS[Math.floor(Math.random() * ALL_CONTAINERS.length)]);
      } else {
        setContainer(pref);
      }
    });
  }, []);

  // Phase 1: Auto-fill (bottle/can start full — they're sealed containers)
  useEffect(() => {
    if (phase !== 'filling') return;
    if (container === 'bottle' || container === 'can') {
      setFillLevel(1);
      setPhase('ready');
      return;
    }
    const interval = setInterval(() => {
      setFillLevel((prev) => {
        const next = prev + 0.012;
        if (next >= 1) {
          clearInterval(interval);
          setPhase('ready');
          return 1;
        }
        return next;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [phase, container]);

  // Phase 2 & 3: Accelerometer with low-pass filter
  useEffect(() => {
    if (phase !== 'ready' && phase !== 'pouring') return;

    Accelerometer.setUpdateInterval(33);
    const subscription = Accelerometer.addListener(({ x }) => {
      const newSmoothed = smoothedRef.current * SMOOTHING_FACTOR + x * (1 - SMOOTHING_FACTOR);
      smoothedRef.current = newSmoothed;
      setSmoothedTilt(newSmoothed);

      const absTilt = Math.abs(newSmoothed);

      if (absTilt > POUR_TILT_THRESHOLD) {
        const tiltExcess = absTilt - POUR_TILT_THRESHOLD;
        const pourRate = Math.min(tiltExcess * tiltExcess * 0.04, MAX_POUR_RATE);

        setPhase('pouring');
        setFillLevel((prev) => {
          const next = prev - pourRate;
          if (next <= 0) {
            setPhase('done');
            return 0;
          }
          return next;
        });
      } else if (absTilt < POUR_TILT_THRESHOLD * 0.7) {
        setPhase((prev) => prev === 'pouring' ? 'ready' : prev);
      }
    });

    return () => subscription.remove();
  }, [phase]);

  // Phase 4: Navigate home
  useEffect(() => {
    if (phase !== 'done') return;
    const timer = setTimeout(() => router.replace('/home'), 1500);
    return () => clearTimeout(timer);
  }, [phase, router]);

  const isPouring = phase === 'pouring' && fillLevel > 0;
  const tiltDeg = (phase === 'ready' || phase === 'pouring')
    ? Math.max(-TILT_TO_ROTATION_DEG, Math.min(TILT_TO_ROTATION_DEG, smoothedTilt * 30))
    : 0;
  const pouringRight = smoothedTilt > 0;

  const pourIntensity = Math.max(0, Math.abs(smoothedTilt) - 0.3);
  // Stream gets thinner and shorter as container empties — natural taper-off
  const fillScale = Math.min(1, fillLevel * 5); // 1.0 above 20% fill, tapers to 0
  const streamWidth = Math.max(4, Math.min(20, 8 + pourIntensity * 30) * fillScale);

  const ContainerComponent = CONTAINER_COMPONENTS[container];

  return (
    <LinearGradient
      colors={['#2D1200', colors.brown, '#1A0A00']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { overflow: 'visible' as const }]}
    >
      <Text style={styles.topText}>
        {phase === 'filling' && 'Pouring...'}
        {phase === 'ready' && 'Tilt your phone to pour one out'}
        {phase === 'pouring' && 'Pouring one out...'}
        {phase === 'done' && 'One poured out. Cheers.'}
      </Text>

      <View style={[styles.glassWrapper, { transform: [{ rotate: `${tiltDeg}deg` }] }]}>
        {/* Pour stream — inside rotating wrapper for correct rim positioning,
            but counter-rotated so it falls straight down with gravity */}
        {isPouring && (
          <PourStream
            streamWidth={streamWidth}
            fillLevel={fillLevel}
            fillScale={fillScale}
            pouringRight={pouringRight}
            containerType={container}
            tiltDeg={tiltDeg}
          />
        )}

        <ContainerComponent fillLevel={fillLevel} tiltDeg={tiltDeg} />
      </View>

      {/* Splash puddle with foam */}
      {isPouring && (
        <View style={styles.puddleWrap}>
          <View
            style={[styles.puddle, {
              width: 40 + (1 - fillLevel) * 80 + pourIntensity * 40,
              opacity: 0.4 + (1 - fillLevel) * 0.4,
            }]}
          />
          <View
            style={[styles.puddleFoam, {
              width: 30 + (1 - fillLevel) * 50,
              opacity: 0.3 + (1 - fillLevel) * 0.3,
            }]}
          />
        </View>
      )}

      <Button
        title="Skip"
        variant="secondary"
        onPress={() => router.replace('/home')}
        style={styles.skipButton}
        textStyle={styles.skipText}
      />
    </LinearGradient>
  );
}

// ─── Pour Stream with Bubbles ────────────────────────────
interface PourStreamProps {
  streamWidth: number;
  fillLevel: number;
  fillScale: number;
  pouringRight: boolean;
  containerType: ContainerType;
  tiltDeg: number;
}

function PourStream({ streamWidth, fillLevel, fillScale, pouringRight, containerType, tiltDeg }: PourStreamProps) {
  const bubbleAnims = useRef<Animated.Value[]>(
    Array.from({ length: NUM_BUBBLES }, () => new Animated.Value(Math.random()))
  ).current;
  const bubbleXOffsets = useRef<number[]>(
    Array.from({ length: NUM_BUBBLES }, () => Math.random())
  ).current;
  const bubbleSizes = useRef<number[]>(
    Array.from({ length: NUM_BUBBLES }, () => 3 + Math.random() * 5)
  ).current;

  useEffect(() => {
    const animations = bubbleAnims.map((anim) => {
      const duration = 500 + Math.random() * 700;
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    });
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [bubbleAnims]);

  // Position stream at the rim — each container has different opening location
  // side: distance from container edge to stream origin
  // top: vertical offset (negative = above container top)
  // spillSize: width of the spill blob at the rim
  const rimConfig = {
    pint: { side: -2, top: 0, spillSize: streamWidth + 10 },
    mug: pouringRight
      ? { side: MUG_HANDLE_W - 4, top: 0, spillSize: streamWidth + 10 }
      : { side: -2, top: 0, spillSize: streamWidth + 10 },
    bottle: {
      side: (BTL_BODY_W - BTL_NECK_W) / 2 + 2,
      top: 0,
      spillSize: streamWidth + 4,
    },
    can: { side: 2, top: -11, spillSize: streamWidth + 6 },
  }[containerType];

  const streamOpacity = (0.55 + fillLevel * 0.4) * fillScale;
  const scaledStreamHeight = STREAM_HEIGHT * fillScale;

  // Taper: stream is wider at top, narrower at bottom (gradual taper)
  const topWidth = streamWidth * 1.8;
  const bottomWidth = streamWidth * 1.1;

  // Follow real-world gravity. The glass rotates by tiltDeg on screen,
  // but real gravity angle ≈ smoothedTilt * 90. Counter-rotate the stream
  // so it falls more perpendicular to the tilted glass.
  const counterRotation = -tiltDeg * 4;

  return (
    <View
      style={[
        streamStyles.container,
        { height: scaledStreamHeight },
        pouringRight
          ? { right: rimConfig.side, top: rimConfig.top }
          : { left: rimConfig.side, top: rimConfig.top },
        {
          transform: [{ rotate: `${counterRotation}deg` }],
          transformOrigin: 'top center',
        },
      ]}
    >
      {/* Spill curve at rim — sized to match the container opening */}
      <View style={[streamStyles.spillCurve, {
        width: rimConfig.spillSize,
        height: 10,
        borderRadius: rimConfig.spillSize / 2,
        opacity: streamOpacity,
      }]} />

      {/* Main stream body — trapezoid for real taper, inside a rounded
          container for smooth edges. Wide at top, genuinely narrower at bottom. */}
      <View style={{
        width: topWidth + 4,
        height: scaledStreamHeight - 10,
        alignSelf: 'center',
        borderRadius: topWidth / 2,
        overflow: 'hidden',
        opacity: streamOpacity,
      }}>
        <View style={{
          width: bottomWidth,
          height: 0,
          alignSelf: 'center',
          borderTopWidth: scaledStreamHeight - 10,
          borderTopColor: colors.amber,
          borderLeftWidth: (topWidth - bottomWidth) / 2,
          borderLeftColor: 'transparent',
          borderRightWidth: (topWidth - bottomWidth) / 2,
          borderRightColor: 'transparent',
        }} />
      </View>

      {/* Light reflection on stream */}
      <View
        style={[streamStyles.streamHighlight, {
          width: Math.max(2, streamWidth * 0.25),
          height: scaledStreamHeight - 40,
          left: pouringRight ? 2 : undefined,
          right: pouringRight ? undefined : 2,
          opacity: streamOpacity * 0.4,
        }]}
      />

      {/* Foam splash at rim */}
      <View style={[streamStyles.rimFoam, { width: streamWidth + 16 }]}>
        <View style={streamStyles.rimFoamDot1} />
        <View style={streamStyles.rimFoamDot2} />
        <View style={streamStyles.rimFoamDot3} />
      </View>

      {/* Bubbles — slight horizontal drift for more natural movement */}
      {bubbleAnims.map((anim, i) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, scaledStreamHeight * 0.55],
        });
        const translateX = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, (bubbleXOffsets[i] - 0.5) * 6, 0],
        });
        const opacity = anim.interpolate({
          inputRange: [0, 0.2, 0.6, 1],
          outputRange: [0, 0.7, 0.4, 0],
        });
        const xPos = (bubbleXOffsets[i] - 0.5) * streamWidth;

        return (
          <Animated.View
            key={i}
            style={[streamStyles.bubble, {
              width: bubbleSizes[i],
              height: bubbleSizes[i],
              borderRadius: bubbleSizes[i] / 2,
              left: streamWidth / 2 + xPos - bubbleSizes[i] / 2 + 4,
              transform: [{ translateY }, { translateX }],
              opacity,
            }]}
          />
        );
      })}

      {/* Drip drops */}
      <View style={[streamStyles.drip, { left: streamWidth / 2 - 2, bottom: -8 }]} />
      <View style={[streamStyles.drip, { left: streamWidth / 2 + 4, bottom: -18, opacity: 0.4 }]} />
    </View>
  );
}

// ─── Shared: Beer Fill + Foam ─────────────────────────────
// Liquid surface tilts opposite to the container rotation (counter-rotation)
// to simulate gravity keeping the liquid level. At lower fill levels the
// surface angle is more dramatic — less liquid means more visible slosh.

function BeerFill({ fillLevel, tiltDeg, containerWidth, containerHeight, showFoam = true }: {
  fillLevel: number;
  tiltDeg: number;
  containerWidth: number;
  containerHeight: number;
  showFoam?: boolean;
}) {
  if (fillLevel <= 0) return null;

  const fillHeight = fillLevel * containerHeight;
  const tiltFactor = Math.abs(tiltDeg) / TILT_TO_ROTATION_DEG; // 0 to 1
  const pourRight = tiltDeg > 0;
  // Smooth blend from flat (0) to fully tilted (1).
  // Ramps from 0.05 to 0.35 tilt so there's no sudden snap.
  const tiltBlend = Math.min(1, Math.max(0, (tiltFactor - 0.05) / 0.3));

  // Tilted targets: pour side at rim, non-pour side drops
  const highTarget = containerHeight;
  const lowTarget = Math.max(0, 2 * fillHeight - containerHeight);

  // Smoothly interpolate between flat and tilted
  const highSide = fillHeight + tiltBlend * (highTarget - fillHeight);
  const lowSide = fillHeight - tiltBlend * (fillHeight - lowTarget);
  const triangleH = highSide - lowSide;

  // Triangle width: full width when lowSide > 0 (fill >= 50%).
  // Below 50% fill, narrow the triangle to conserve volume — the liquid
  // gathers in the pour-side corner as it drains.
  // Smooth transition as lowSide approaches 0.
  const narrowW = Math.max(8, 2 * fillLevel * containerWidth);
  const widthBlend = Math.min(1, lowSide / 20); // smooth over 20px
  const triangleW = narrowW + widthBlend * (containerWidth - narrowW);

  const foamBand = 8 + fillLevel * 10;

  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: containerHeight,
      overflow: 'hidden',
    }}>
      {/* Base liquid rectangle — solid amber, overlaps triangle by 4px */}
      {lowSide > 1 && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: lowSide + 4,
          backgroundColor: colors.amber,
        }} />
      )}

      {/* Liquid triangle + optional foam */}
      {triangleH > 2 ? (
        <>
          {/* Foam triangle behind (only for open containers like glasses/mugs) */}
          {showFoam && (
            <View
              style={{
                position: 'absolute',
                top: containerHeight - highSide - foamBand,
                ...(pourRight ? { right: 0 } : { left: 0 }),
                width: 0,
                height: 0,
                backgroundColor: 'transparent',
                borderStyle: 'solid',
                borderBottomWidth: triangleH + foamBand,
                borderBottomColor: colors.foam,
                ...(pourRight
                  ? { borderLeftWidth: triangleW + foamBand, borderLeftColor: 'transparent' }
                  : { borderRightWidth: triangleW + foamBand, borderRightColor: 'transparent' }
                ),
                opacity: 0.93,
              }}
            />
          )}
          {/* Amber triangle */}
          <View
            style={{
              position: 'absolute',
              top: containerHeight - highSide,
              ...(pourRight ? { right: 0 } : { left: 0 }),
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderStyle: 'solid',
              borderBottomWidth: triangleH,
              borderBottomColor: colors.amber,
              ...(pourRight
                ? { borderLeftWidth: triangleW, borderLeftColor: 'transparent' }
                : { borderRightWidth: triangleW, borderRightColor: 'transparent' }
              ),
            }}
          />
        </>
      ) : (
        showFoam && (
          /* Flat foam band — when upright */
          <View style={{
            position: 'absolute',
            bottom: fillHeight - foamBand,
            left: 0, right: 0,
            height: foamBand,
            backgroundColor: colors.foam,
            opacity: 0.8,
          }} />
        )
      )}
    </View>
  );
}

// ─── Pint Glass ──────────────────────────────────────────
function PintGlass({ fillLevel, tiltDeg }: { fillLevel: number; tiltDeg: number }) {
  const innerHeight = PINT_HEIGHT - 20;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={pintStyles.body}>
        <BeerFill fillLevel={fillLevel} tiltDeg={tiltDeg} containerWidth={PINT_WIDTH} containerHeight={innerHeight} />
        <View style={pintStyles.shine} />
        <View style={pintStyles.shineWide} />
      </View>
      <View style={pintStyles.base} />
    </View>
  );
}

// ─── Frosty Mug ──────────────────────────────────────────
function FrostyMug({ fillLevel, tiltDeg }: { fillLevel: number; tiltDeg: number }) {
  const innerHeight = MUG_HEIGHT - 20;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={mugStyles.bodyRow}>
        <View style={mugStyles.body}>
          <BeerFill fillLevel={fillLevel} tiltDeg={tiltDeg} containerWidth={MUG_WIDTH} containerHeight={innerHeight} />
          <View style={mugStyles.shine} />
          <View style={[mugStyles.frost, { top: 8, left: 15 }]} />
          <View style={[mugStyles.frost, { top: 20, left: 40 }]} />
          <View style={[mugStyles.frost, { top: 12, right: 20 }]} />
          <View style={[mugStyles.frost, { top: 30, left: 25 }]} />
          <View style={[mugStyles.frost, { top: 18, right: 35 }]} />
        </View>
        <View style={mugStyles.handle} />
      </View>
      <View style={mugStyles.base} />
    </View>
  );
}

// ─── Bottle Fill (SVG clip to bottle silhouette) ─────────
// Renders the liquid as a single SVG Polygon clipped to the true bottle
// outline — neck, shoulder cubic curves, and rounded body base — so the
// amber colour never bleeds outside the glass silhouette and the liquid
// surface is continuous from body through shoulder up into the neck.
const BTL_NECK_H = 50;
const BTL_SHOULDER_H = 24;

// Bottle interior silhouette path (SVG coords, y=0 at top / bottle mouth):
//   Neck: 30px wide centred in the 90px frame (x 30..60), 50px tall.
//   Shoulder: cubic curves flaring from 30px@y=50 to 90px@y=74.
//   Body: full width x 0..90, y 74..234 with 8px rounded bottom corners.
const BOTTLE_CLIP_D =
  'M 30 0 L 60 0 L 60 50 C 60 62 78 64 90 74 L 90 226 Q 90 234 82 234 L 8 234 Q 0 234 0 226 L 0 74 C 12 64 30 62 30 50 Z';

// Neck left edge within the 90px frame (used for the neck shine).
const BTL_NECK_X0 = (BTL_BODY_W - BTL_NECK_W) / 2; // 30

// Polygon approximation of the bottle interior (matches BOTTLE_CLIP_D),
// SVG coords, y=0 at the mouth. Used only to compute the liquid area.
const BOTTLE_POLY: Array<[number, number]> = [
  [30, 0], [60, 0], [60, 50], [72, 58], [82, 66], [90, 74],
  [90, 226], [86, 232], [80, 234], [10, 234], [4, 232], [0, 226],
  [0, 74], [10, 64], [22, 57], [30, 50],
];

function polyArea(pts: Array<[number, number]>): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

// Sutherland–Hodgman clip of a polygon to the half-plane n·p <= t.
function clipHalfPlane(
  pts: Array<[number, number]>, nx: number, ny: number, t: number,
): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const A = pts[i];
    const B = pts[(i + 1) % n];
    const da = nx * A[0] + ny * A[1] - t;
    const db = nx * B[0] + ny * B[1] - t;
    if (da <= 0) out.push(A);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const s = da / (da - db);
      out.push([A[0] + s * (B[0] - A[0]), A[1] + s * (B[1] - A[1])]);
    }
  }
  return out;
}

const BOTTLE_AREA = polyArea(BOTTLE_POLY);
// Liquid-surface steepness: radians of surface tilt per degree of on-screen
// bottle rotation. The bottle only rotates ~25° but the phone tilts much
// more, so the surface must over-rotate for the neck to fill while pouring.
const BTL_TILT_GAIN = 0.085;
const BTL_MAX_SURFACE = 1.45; // rad clamp (~83°) — steeper keeps the neck fed
// As the bottle empties you tip it up more for the last drops; ramp the
// surface steeper with emptiness so the final liquid stays drawn toward the
// neck instead of detaching from the stream. Zero effect when full.
const BTL_EMPTY_GAIN = 0.6;
const BTL_EMPTY_STEEPEN = 0.08; // extra rad of clamp at empty (~83°→~88°)
// Thickness (viewBox px) of the lighter meniscus band along the surface, so
// the liquid top reads as a surface catching light rather than a razor cut.
const BTL_SURFACE_BAND = 7;

function BottleFill({ fillLevel, tiltDeg }: { fillLevel: number; tiltDeg: number }) {
  if (fillLevel <= 0) return null;
  const H = BTL_NECK_H + BTL_SHOULDER_H + BTL_BODY_H; // 234

  // One flat liquid surface; the beer is the whole region below it. The
  // surface OFFSET is solved so the AIR area above it equals (1-fill) of the
  // bottle. This conserves volume at ANY tilt: a full bottle is always
  // completely full (no fake air), the level genuinely drops as it empties,
  // and the neck fills/drains naturally — one region, no seams.
  const emptiness = 1 - fillLevel; // 0 full → 1 empty
  const maxSurf = BTL_MAX_SURFACE + emptiness * BTL_EMPTY_STEEPEN;
  const phi = Math.max(
    -maxSurf,
    Math.min(
      maxSurf,
      tiltDeg * BTL_TILT_GAIN * (1 + emptiness * BTL_EMPTY_GAIN),
    ),
  );
  // Surface normal points toward the air. For pourRight (tiltDeg>0) the beer
  // gathers right, so air is up-and-left → nx negative.
  const nx = -Math.sin(phi);
  const ny = -Math.cos(phi);
  const targetAir = (1 - fillLevel) * BOTTLE_AREA;

  let lo = Infinity;
  let hi = -Infinity;
  for (const [x, y] of BOTTLE_POLY) {
    const d = nx * x + ny * y;
    if (d < lo) lo = d;
    if (d > hi) hi = d;
  }
  let t = (lo + hi) / 2;
  for (let it = 0; it < 24; it++) {
    t = (lo + hi) / 2;
    const beer = clipHalfPlane(BOTTLE_POLY, nx, ny, t);
    const air = BOTTLE_AREA - (beer.length >= 3 ? polyArea(beer) : 0);
    if (air > targetAir) lo = t; // too much air → push surface down (larger t)
    else hi = t;
  }
  const beerPts = clipHalfPlane(BOTTLE_POLY, nx, ny, t);
  if (beerPts.length < 3) return null;
  const points = beerPts
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');

  // Meniscus: the slice of beer within BTL_SURFACE_BAND of the surface line
  // (n·p >= t - band), drawn a touch lighter so the top edge looks like a
  // liquid surface, not a hard cut.
  const meniscus = clipHalfPlane(
    beerPts, -nx, -ny, -(t - BTL_SURFACE_BAND),
  );
  const meniscusPoints =
    meniscus.length >= 3
      ? meniscus.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
      : null;

  return (
    <Svg
      width={BTL_BODY_W}
      height={H}
      viewBox={`0 0 ${BTL_BODY_W} ${H}`}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <Defs>
        <ClipPath id="bottleClip">
          <Path d={BOTTLE_CLIP_D} />
        </ClipPath>
      </Defs>
      <Polygon points={points} fill={colors.amber} clipPath="url(#bottleClip)" />
      {meniscusPoints && (
        <Polygon
          points={meniscusPoints}
          fill={colors.amberLight}
          opacity={0.5}
          clipPath="url(#bottleClip)"
        />
      )}
    </Svg>
  );
}

// ─── Beer Bottle ─────────────────────────────────────────
function BeerBottle({ fillLevel, tiltDeg }: { fillLevel: number; tiltDeg: number }) {
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Cap */}
      <View style={btlStyles.cap} />
      {/* Bottle interior — liquid + glass outline share one silhouette */}
      <View style={btlStyles.bottleInterior}>
        <BottleFill fillLevel={fillLevel} tiltDeg={tiltDeg} />
        {/* Glass outline + shine, drawn from the SAME path the liquid is
            clipped to, so the outline and beer always align (no shoulder
            crescents). */}
        <Svg
          width={BTL_BODY_W}
          height={BTL_NECK_H + BTL_SHOULDER_H + BTL_BODY_H}
          viewBox={`0 0 ${BTL_BODY_W} ${BTL_NECK_H + BTL_SHOULDER_H + BTL_BODY_H}`}
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          <Path
            d={BOTTLE_CLIP_D}
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={2}
          />
          <Path
            d={`M 13 ${BTL_NECK_H + BTL_SHOULDER_H + 14} L 13 ${BTL_NECK_H + BTL_SHOULDER_H + BTL_BODY_H - 26}`}
            stroke="rgba(255,255,255,0.13)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d={`M ${BTL_NECK_X0 + 4} 7 L ${BTL_NECK_X0 + 4} ${BTL_NECK_H - 8}`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
        {/* Label */}
        <View style={btlStyles.label}>
          <View style={btlStyles.labelBorder}>
            <Text style={btlStyles.labelBrand}>O'CLOCK</Text>
            <Text style={btlStyles.labelSub}>BREWING CO.</Text>
            <View style={btlStyles.labelLine} />
            <Text style={btlStyles.labelType}>LAGER</Text>
          </View>
        </View>
      </View>
      {/* Base */}
      <View style={btlStyles.base} />
    </View>
  );
}

// ─── Beer Can ────────────────────────────────────────────
function BeerCan({ fillLevel: _, tiltDeg: __ }: { fillLevel: number; tiltDeg: number }) {
  // Can is opaque — no visible liquid level
  return (
    <View style={{ alignItems: 'center' }}>
      {/* Pull tab */}
      <View style={canStyles.tabBase}>
        <View style={canStyles.tabRing} />
      </View>
      {/* Top rim */}
      <View style={canStyles.topRim} />
      {/* Can body */}
      <View style={canStyles.body}>
        <LinearGradient
          colors={['#C0C0C0', '#A0A0A0', '#888888']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={canStyles.bodyGradient}
        >
          {/* Brand design */}
          <View style={canStyles.brandStripe} />
          <View style={canStyles.brandArea}>
            <Text style={canStyles.brandName}>O'CLOCK</Text>
            <View style={canStyles.brandDivider} />
            <Text style={canStyles.brandType}>COLD ONE</Text>
            <Text style={canStyles.brandEst}>EST. 2014</Text>
          </View>
          <View style={canStyles.brandStripeBottom} />
          {/* Can shine */}
          <View style={canStyles.canShine} />
          <View style={canStyles.canShineNarrow} />
        </LinearGradient>
      </View>
      {/* Bottom rim */}
      <View style={canStyles.bottomRim} />
    </View>
  );
}

const CONTAINER_COMPONENTS: Record<ContainerType, React.ComponentType<{ fillLevel: number; tiltDeg: number }>> = {
  pint: PintGlass,
  mug: FrostyMug,
  bottle: BeerBottle,
  can: BeerCan,
};

// ─── Shared Styles ───────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  topText: {
    color: colors.amberLight,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    minHeight: 70,
    textShadowColor: 'rgba(69,26,3,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  glassWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    overflow: 'visible',
  },
  puddleWrap: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  puddle: {
    height: 12,
    backgroundColor: colors.amber,
    borderRadius: 20,
  },
  puddleFoam: {
    height: 6,
    backgroundColor: colors.creamDark,
    borderRadius: 10,
    marginTop: -3,
  },
  skipButton: {
    position: 'absolute',
    bottom: 60,
    right: spacing.lg,
  },
  skipText: {
    fontSize: fontSize.sm,
  },
});

// ─── Pour Stream Styles ──────────────────────────────────
const streamStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
    overflow: 'visible',
  },
  spillCurve: {
    backgroundColor: colors.amber,
    marginBottom: -4,
  },
  body: {
    alignItems: 'center',
  },
  streamHighlight: {
    position: 'absolute',
    top: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  rimFoam: {
    position: 'absolute',
    top: -4,
    height: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  rimFoamDot1: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.creamDark, opacity: 0.8,
  },
  rimFoamDot2: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.creamDark, opacity: 0.6,
  },
  rimFoamDot3: {
    width: 5, height: 5, borderRadius: 2.5,
    backgroundColor: colors.creamDark, opacity: 0.5,
  },
  bubble: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  drip: {
    position: 'absolute',
    width: 6, height: 10, borderRadius: 3,
    backgroundColor: colors.amber, opacity: 0.7,
  },
});

// ─── Pint Glass Styles ───────────────────────────────────
const pintStyles = StyleSheet.create({
  body: {
    width: PINT_WIDTH,
    height: PINT_HEIGHT,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.22)',
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  shine: {
    position: 'absolute', top: 10, left: 12, width: 3, height: '65%',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2,
  },
  shineWide: {
    position: 'absolute', top: 20, left: 18, width: 6, height: '40%',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3,
  },
  base: {
    width: PINT_WIDTH + 10, height: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3, borderBottomLeftRadius: 5, borderBottomRightRadius: 5,
  },
});

// ─── Frosty Mug Styles ──────────────────────────────────
const mugStyles = StyleSheet.create({
  bodyRow: { flexDirection: 'row', alignItems: 'center' },
  body: {
    width: MUG_WIDTH, height: MUG_HEIGHT,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.22)',
    borderTopWidth: 0, borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
    overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)',
  },
  shine: {
    position: 'absolute', top: 10, left: 12, width: 3, height: '65%',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2,
  },
  frost: {
    position: 'absolute', width: 4, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  handle: {
    width: MUG_HANDLE_W, height: MUG_HEIGHT * 0.45,
    borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)',
    borderLeftWidth: 0, borderTopRightRadius: 14, borderBottomRightRadius: 14,
    backgroundColor: 'transparent', marginLeft: -3,
  },
  base: {
    width: MUG_WIDTH + MUG_HANDLE_W + 6, height: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 3, marginRight: MUG_HANDLE_W,
  },
});

// ─── Beer Bottle Styles ──────────────────────────────────
const btlStyles = StyleSheet.create({
  cap: {
    width: 22, height: 10, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: -1,
  },
  // Container for neck + shoulder + body — BottleFill clips liquid to shape
  bottleInterior: {
    width: BTL_BODY_W,
    height: BTL_NECK_H + BTL_SHOULDER_H + BTL_BODY_H,
    overflow: 'hidden',
    alignItems: 'center',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  label: {
    position: 'absolute', top: 104, left: 8, right: 8,
    height: 80, backgroundColor: 'rgba(254,243,199,0.15)',
    borderRadius: 4, alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  labelBorder: {
    alignItems: 'center', padding: 4,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3, width: '90%',
  },
  labelBrand: {
    color: 'rgba(255,255,255,0.7)', fontSize: 13,
    fontWeight: 'bold', letterSpacing: 2,
  },
  labelSub: {
    color: 'rgba(255,255,255,0.4)', fontSize: 6,
    letterSpacing: 1.5, marginTop: 1,
  },
  labelLine: {
    width: '80%', height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 3,
  },
  labelType: {
    color: 'rgba(255,255,255,0.5)', fontSize: 8,
    fontWeight: '600', letterSpacing: 3,
  },
  base: {
    width: BTL_BODY_W + 6, height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 3,
  },
});

// ─── Beer Can Styles ─────────────────────────────────────
const canStyles = StyleSheet.create({
  tabBase: {
    width: 24, height: 6, borderRadius: 2,
    backgroundColor: 'rgba(200,200,200,0.5)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: -1,
  },
  tabRing: {
    width: 10, height: 4, borderRadius: 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'transparent',
  },
  topRim: {
    width: CAN_W - 10, height: 6,
    backgroundColor: 'rgba(180,180,180,0.5)',
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
    marginBottom: -1,
  },
  body: {
    width: CAN_W, height: CAN_H,
    borderRadius: 4, overflow: 'hidden',
  },
  bodyGradient: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  brandStripe: {
    position: 'absolute', top: 20, left: 0, right: 0, height: 4,
    backgroundColor: colors.amberDark,
  },
  brandArea: {
    alignItems: 'center', backgroundColor: 'rgba(69,26,3,0.85)',
    paddingVertical: 14, paddingHorizontal: 10,
    borderRadius: 2, width: '85%',
  },
  brandName: {
    color: colors.amberLight, fontSize: 20,
    fontWeight: 'bold', letterSpacing: 3,
  },
  brandDivider: {
    width: '60%', height: 1,
    backgroundColor: colors.amberDark, marginVertical: 5,
  },
  brandType: {
    color: colors.amber, fontSize: 11,
    fontWeight: '700', letterSpacing: 4,
  },
  brandEst: {
    color: 'rgba(252,211,77,0.5)', fontSize: 7,
    letterSpacing: 2, marginTop: 4,
  },
  brandStripeBottom: {
    position: 'absolute', bottom: 20, left: 0, right: 0, height: 4,
    backgroundColor: colors.amberDark,
  },
  canShine: {
    position: 'absolute', top: 0, left: 12, width: 8, height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  canShineNarrow: {
    position: 'absolute', top: 0, left: 22, width: 3, height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bottomRim: {
    width: CAN_W - 10, height: 6,
    backgroundColor: 'rgba(180,180,180,0.5)',
    borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
    marginTop: -1,
  },
});
