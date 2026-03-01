import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, fontSize } from '../src/theme';
import { getGlassStyle } from '../src/utils/storage';
import Button from '../src/components/Button';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STREAM_HEIGHT = SCREEN_HEIGHT * 0.45;
const NUM_BUBBLES = 8;

// Physics tuning
const SMOOTHING_FACTOR = 0.82;
const MAX_POUR_RATE = 0.014;
const TILT_TO_ROTATION_DEG = 25;
const OVERFLOW_POUR_SCALE = 0.0003; // pour rate per pixel of overflow

type ContainerType = 'pint' | 'mug' | 'bottle' | 'can';
const ALL_CONTAINERS: ContainerType[] = ['pint', 'mug', 'bottle', 'can'];

// Container dimensions (hoisted for physics calculations)
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

// Each container's inner fill dimensions for iBeer-style rim physics
// width: how wide the liquid body is (determines surface angle rise)
// innerHeight: max fill height inside the container
const CONTAINER_PHYSICS: Record<ContainerType, { width: number; innerHeight: number }> = {
  pint: { width: PINT_WIDTH - 6, innerHeight: PINT_HEIGHT - 20 },
  mug: { width: MUG_WIDTH - 6, innerHeight: MUG_HEIGHT - 20 },
  bottle: { width: BTL_BODY_W - 4, innerHeight: BTL_BODY_H - 14 },
  can: { width: CAN_W - 8, innerHeight: CAN_H - 10 },
};

export default function PourScreen() {
  const router = useRouter();
  const [fillLevel, setFillLevel] = useState(0);
  const [phase, setPhase] = useState<'filling' | 'ready' | 'pouring' | 'done'>('filling');
  const [smoothedTilt, setSmoothedTilt] = useState(0);
  const [container, setContainer] = useState<ContainerType>('pint');
  const smoothedRef = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    getGlassStyle().then((pref) => {
      if (pref === 'random') {
        setContainer(ALL_CONTAINERS[Math.floor(Math.random() * ALL_CONTAINERS.length)]);
      } else {
        setContainer(pref);
      }
    });
  }, []);

  // Phase 1: Auto-fill
  useEffect(() => {
    if (phase !== 'filling') return;
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
  }, [phase]);

  // Phase 2 & 3: Accelerometer with iBeer-style rim-overflow physics
  // Liquid surface stays level relative to gravity. It only pours when
  // the angled surface rises past the container rim on the tilting side.
  // Uses phaseRef to avoid re-subscribing on every phase change.
  useEffect(() => {
    if (phase !== 'ready' && phase !== 'pouring') return;

    const physics = CONTAINER_PHYSICS[container];
    Accelerometer.setUpdateInterval(33);
    const subscription = Accelerometer.addListener(({ x }) => {
      const currentPhase = phaseRef.current;
      if (currentPhase !== 'ready' && currentPhase !== 'pouring') return;

      const newSmoothed = smoothedRef.current * SMOOTHING_FACTOR + x * (1 - SMOOTHING_FACTOR);
      smoothedRef.current = newSmoothed;
      setSmoothedTilt(newSmoothed);

      const visualTiltDeg = Math.max(-TILT_TO_ROTATION_DEG, Math.min(TILT_TO_ROTATION_DEG, newSmoothed * 30));
      const tiltRad = (Math.abs(visualTiltDeg) * Math.PI) / 180;
      const surfaceRise = (physics.width / 2) * Math.tan(tiltRad);

      setFillLevel((prev) => {
        const fillHeight = prev * physics.innerHeight;
        const pourSideHeight = fillHeight + surfaceRise;
        const overflow = pourSideHeight - physics.innerHeight;

        if (overflow > 0) {
          const pourRate = Math.min(overflow * OVERFLOW_POUR_SCALE, MAX_POUR_RATE);
          setPhase('pouring');
          const next = prev - pourRate;
          if (next <= 0) {
            setPhase('done');
            return 0;
          }
          return next;
        } else {
          if (phaseRef.current === 'pouring') setPhase('ready');
          return prev;
        }
      });
    });

    return () => subscription.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [container]);

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
  const streamWidth = Math.max(8, Math.min(20, 8 + pourIntensity * 30));

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
        {/* Pour stream — originates from the rim/opening */}
        {isPouring && (
          <PourStream
            streamWidth={streamWidth}
            fillLevel={fillLevel}
            pouringRight={pouringRight}
            containerType={container}
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
  pouringRight: boolean;
  containerType: ContainerType;
}

function PourStream({ streamWidth, fillLevel, pouringRight, containerType }: PourStreamProps) {
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
  // side: distance from container edge to stream center
  // top: vertical offset (negative = above container top)
  // spillSize: width of the spill blob at the rim to match opening width
  const rimConfig = {
    // Pint: wide open top (140px), pour right off the rim edge
    pint: { side: -2, top: 0, spillSize: streamWidth + 10 },
    // Mug: body is 130px but handle adds width on right side
    // Pour from the body rim, not the handle
    mug: pouringRight
      ? { side: MUG_HANDLE_W - 4, top: 0, spillSize: streamWidth + 10 }
      : { side: -2, top: 0, spillSize: streamWidth + 10 },
    // Bottle: narrow neck (30px) at the very top, cap + neck above body
    // Stream exits from lip of the narrow neck opening
    bottle: {
      side: (BTL_BODY_W - BTL_NECK_W) / 2 + 2,
      top: -(BTL_NECK_H + 8),
      spillSize: streamWidth + 4,
    },
    // Can: opening near the pull tab at top (tab is 24px wide, rim is 90px)
    // Pour from the rim edge, above the body
    can: { side: 2, top: -10, spillSize: streamWidth + 6 },
  }[containerType];

  const streamOpacity = 0.55 + fillLevel * 0.4;

  return (
    <View
      style={[
        streamStyles.container,
        pouringRight
          ? { right: rimConfig.side, top: rimConfig.top }
          : { left: rimConfig.side, top: rimConfig.top },
      ]}
    >
      {/* Spill curve at rim — sized to match the container opening */}
      <View style={[streamStyles.spillCurve, {
        width: rimConfig.spillSize,
        height: 10,
        borderRadius: rimConfig.spillSize / 2,
        opacity: streamOpacity,
      }]} />

      {/* Main stream body — gradient for depth */}
      <LinearGradient
        colors={[colors.amberLight, colors.amber, colors.amberDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[streamStyles.body, { width: streamWidth, opacity: streamOpacity }]}
      />

      {/* Light reflection on stream */}
      <View
        style={[streamStyles.streamHighlight, {
          width: Math.max(2, streamWidth * 0.25),
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

// ─── Shared: Sloshing Beer Fill + Foam ───────────────────
// Counter-rotates the fill so liquid stays level relative to gravity.
// Foam is integrated into the fill as one unified body — the foam top
// naturally reaches the rim on the pour side when tilted (iBeer style).
interface BeerFillProps {
  fillHeight: number;
  tiltDeg: number;
  containerWidth: number;
  containerHeight: number;
}

function BeerFill({ fillHeight, tiltDeg, containerWidth, containerHeight }: BeerFillProps) {
  const liquidRotation = -tiltDeg * 1.8;
  const extraSide = 80;
  // Clip to container height so the angled surface visually touches the rim
  const clipHeight = Math.min(fillHeight, containerHeight);

  return (
    // Non-rotating clip container — bounded to container height, hides corners
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: clipHeight,
      overflow: 'hidden',
    }}>
      {/* Rotating fill — the angled surface rises to rim on pour side */}
      <View style={{
        position: 'absolute',
        bottom: -extraSide,
        left: -extraSide,
        right: -extraSide,
        height: clipHeight + extraSide * 2,
        transform: [{ rotate: `${liquidRotation}deg` }],
      }}>
        <LinearGradient
          colors={[colors.amberLight, colors.amber, colors.amberDark]}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: clipHeight + extraSide * 2,
          }}
        />
        {/* Foam band — sits on top of the liquid, rotates with it */}
        {fillHeight > 8 && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            backgroundColor: colors.creamDark,
            opacity: 0.85,
          }} />
        )}
      </View>
    </View>
  );
}

// ─── Pint Glass ──────────────────────────────────────────
function PintGlass({ fillLevel, tiltDeg }: { fillLevel: number; tiltDeg: number }) {
  const innerH = PINT_HEIGHT - 20;
  const fillHeight = fillLevel * innerH;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={pintStyles.body}>
        <BeerFill fillHeight={fillHeight} tiltDeg={tiltDeg} containerWidth={PINT_WIDTH} containerHeight={innerH} />
        <View style={pintStyles.shine} />
        <View style={pintStyles.shineWide} />
      </View>
      <View style={pintStyles.base} />
    </View>
  );
}

// ─── Frosty Mug ──────────────────────────────────────────
function FrostyMug({ fillLevel, tiltDeg }: { fillLevel: number; tiltDeg: number }) {
  const innerH = MUG_HEIGHT - 20;
  const fillHeight = fillLevel * innerH;
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={mugStyles.bodyRow}>
        <View style={mugStyles.body}>
          <BeerFill fillHeight={fillHeight} tiltDeg={tiltDeg} containerWidth={MUG_WIDTH} containerHeight={innerH} />
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
  const innerH = BTL_BODY_H - 14;
  const bodyFill = Math.min(fillLevel * 1.2, 1) * innerH;
  const neckFill = fillLevel > 0.85 ? (fillLevel - 0.85) / 0.15 * (BTL_NECK_H - 20) : 0;

  return (
    <View style={{ alignItems: 'center' }}>
      {/* Cap */}
      <View style={btlStyles.cap} />
      {/* Neck */}
      <View style={btlStyles.neck}>
        {neckFill > 0 && (
          <View style={[btlStyles.neckFill, {
            height: neckFill,
            transform: [{ rotate: `${-tiltDeg}deg` }],
            left: -5, right: -5,
          }]} />
        )}
        <View style={btlStyles.neckShine} />
      </View>
      {/* Shoulder — curved taper from neck to body */}
      <View style={btlStyles.shoulder}>
        <View style={btlStyles.shoulderInner} />
      </View>
      {/* Body */}
      <View style={btlStyles.body}>
        <BeerFill fillHeight={bodyFill} tiltDeg={tiltDeg} containerWidth={BTL_BODY_W} containerHeight={innerH} />
        <View style={btlStyles.bodyShine} />
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
    height: STREAM_HEIGHT,
    alignItems: 'center',
    zIndex: 10,
  },
  spillCurve: {
    backgroundColor: colors.amber,
    marginBottom: -3,
  },
  body: {
    height: STREAM_HEIGHT - 10,
    borderRadius: 10,
  },
  streamHighlight: {
    position: 'absolute',
    top: 14,
    height: STREAM_HEIGHT - 40,
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
    width: 20, height: 8, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  neck: {
    width: BTL_NECK_W, height: BTL_NECK_H,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  neckFill: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.amber, opacity: 0.8,
  },
  neckShine: {
    position: 'absolute', top: 5, left: 5, width: 2, height: '70%',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 1,
  },
  shoulder: {
    width: BTL_BODY_W,
    height: 22,
    overflow: 'hidden',
    marginTop: -1,
  },
  shoulderInner: {
    width: BTL_BODY_W,
    height: BTL_BODY_W,
    borderRadius: BTL_BODY_W / 2,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 0,
    marginTop: -(BTL_BODY_W - 22),
  },
  body: {
    width: BTL_BODY_W, height: BTL_BODY_H,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)',
    borderTopWidth: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
    overflow: 'hidden',
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
  },
});
