import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize } from '../src/theme';
import { getGlassStyle } from '../src/utils/storage';
import Button from '../src/components/Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STREAM_HEIGHT = SCREEN_HEIGHT * 0.28;
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
const BTL_NECK_H = 70;
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
        if (phase === 'pouring') setPhase('ready');
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
      style={styles.container}
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

  // Taper: stream is wider at top, narrower at bottom
  const topWidth = streamWidth * 1.15;
  const bottomWidth = streamWidth * 0.55;

  // Counter-rotate to cancel the glass wrapper's rotation, so the stream
  // falls straight down with gravity. Add a small arc angle for natural
  // outward momentum as liquid leaves the lip.
  const arcAngle = pouringRight ? 5 : -5;
  const counterRotation = -tiltDeg + arcAngle;

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

      {/* Main stream body — gradient for depth, tapered from wide top to narrow bottom */}
      <View style={[streamStyles.body, { height: scaledStreamHeight - 10, opacity: streamOpacity, overflow: 'hidden' as const }]}>
        <LinearGradient
          colors={[colors.amberLight, colors.amber, colors.amberDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            width: topWidth,
            height: scaledStreamHeight - 10,
            borderTopLeftRadius: topWidth / 2,
            borderTopRightRadius: topWidth / 2,
            borderBottomLeftRadius: bottomWidth / 2,
            borderBottomRightRadius: bottomWidth / 2,
            alignSelf: 'center',
          }}
        />
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

      {/* Bubbles */}
      {bubbleAnims.map((anim, i) => {
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, STREAM_HEIGHT * 0.55],
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
              transform: [{ translateY }],
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

function BeerFill({ fillLevel, tiltDeg, containerWidth, containerHeight }: {
  fillLevel: number;
  tiltDeg: number;
  containerWidth: number;
  containerHeight: number;
}) {
  if (fillLevel <= 0) return null;

  const fillHeight = fillLevel * containerHeight;
  const tiltFactor = Math.abs(tiltDeg) / TILT_TO_ROTATION_DEG; // 0 to 1
  const pourRight = tiltDeg > 0;
  const foamHeight = 4 + fillLevel * 12;

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

  return (
    <View style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: containerHeight,
      overflow: 'hidden',
    }}>
      {/* Base liquid — gradient goes dark at bottom to amber at top so
          the top edge matches the triangle color = no visible seam */}
      {lowSide > 1 && (
        <LinearGradient
          colors={[colors.amberDark, colors.amber]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: lowSide,
          }}
        />
      )}

      {/* Foam — rendered BEHIND liquid triangle so only the surface band shows.
          Thicker foam with warm cream color at high opacity. */}
      {triangleH > 2 && tiltBlend > 0.1 && (
        <View
          style={{
            position: 'absolute',
            top: containerHeight - highSide - foamHeight * 2.5,
            ...(pourRight ? { right: 0 } : { left: 0 }),
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderBottomWidth: triangleH + foamHeight * 2.5,
            borderBottomColor: '#FFF8E1',
            ...(pourRight
              ? { borderLeftWidth: triangleW, borderLeftColor: 'transparent' }
              : { borderRightWidth: triangleW, borderRightColor: 'transparent' }
            ),
            opacity: Math.min(0.92, 0.9 * tiltBlend),
          }}
        />
      )}

      {/* Angled surface — triangle from lowSide to highSide on pour side.
          Width narrows below 50% fill as liquid gathers in pour corner. */}
      {triangleH > 2 && (
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
      )}

      {/* Foam band — flat on top of liquid when upright, crossfades out as
          the diagonal foam triangle takes over during tilt */}
      {fillHeight > foamHeight && (
        <View style={{
          position: 'absolute',
          bottom: fillHeight - foamHeight,
          left: 0, right: 0,
          height: foamHeight,
          backgroundColor: '#FFF8E1',
          opacity: (0.8 + fillLevel * 0.2) * Math.max(0, 1 - tiltBlend * 1.5),
        }} />
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

// ─── Beer Bottle ─────────────────────────────────────────
function BeerBottle({ fillLevel, tiltDeg }: { fillLevel: number; tiltDeg: number }) {
  // Total interior height: neck(50) + shoulder(24) + body(160) = 234
  // BeerFill spans the entire interior so liquid is one continuous body
  // that naturally climbs into the neck when tilted.
  const neckH = 50;
  const shoulderH = 24;
  const totalInteriorH = neckH + shoulderH + BTL_BODY_H;

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Cap */}
      <View style={btlStyles.cap} />
      {/* Unified liquid container: neck + shoulder + body share one BeerFill */}
      <View style={btlStyles.bottleInterior}>
        {/* One continuous BeerFill spanning the entire bottle interior */}
        <BeerFill
          fillLevel={fillLevel}
          tiltDeg={tiltDeg}
          containerWidth={BTL_BODY_W}
          containerHeight={totalInteriorH}
        />
        {/* Neck outline — just borders, no separate fill */}
        <View style={btlStyles.neckOverlay}>
          <View style={btlStyles.neckShine} />
        </View>
        {/* Shoulder outline */}
        <View style={btlStyles.shoulderOverlay} />
        {/* Body outline + label + shine */}
        <View style={btlStyles.bodyOverlay}>
          <View style={btlStyles.bodyShine} />
          <View style={btlStyles.label}>
            <View style={btlStyles.labelBorder}>
              <Text style={btlStyles.labelBrand}>O'CLOCK</Text>
              <Text style={btlStyles.labelSub}>BREWING CO.</Text>
              <View style={btlStyles.labelLine} />
              <Text style={btlStyles.labelType}>LAGER</Text>
            </View>
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
  },
  spillCurve: {
    backgroundColor: colors.amber,
    marginBottom: -3,
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
  // Unified container for neck + shoulder + body — one BeerFill fills this
  bottleInterior: {
    width: BTL_BODY_W,
    height: 50 + 24 + BTL_BODY_H, // neck + shoulder + body
    overflow: 'hidden',
    alignItems: 'center',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  // Neck, shoulder, body are now overlays (just borders/shape, no fill)
  neckOverlay: {
    position: 'absolute', top: 0,
    width: BTL_NECK_W, height: 50,
    alignSelf: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 0, borderBottomWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  neckShine: {
    position: 'absolute', top: 5, left: 5, width: 2, height: '70%',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 1,
  },
  shoulderOverlay: {
    position: 'absolute', top: 50,
    width: BTL_BODY_W, height: 24,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 0, borderBottomWidth: 0,
    borderTopLeftRadius: BTL_BODY_W / 2,
    borderTopRightRadius: BTL_BODY_W / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bodyOverlay: {
    position: 'absolute', top: 50 + 24,
    width: BTL_BODY_W, height: BTL_BODY_H,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 0,
    borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bodyShine: {
    position: 'absolute', top: 8, left: 10, width: 3, height: '60%',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 2,
  },
  label: {
    position: 'absolute', top: 30, left: 8, right: 8,
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
