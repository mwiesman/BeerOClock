import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import { colors, spacing, fontSize } from '../src/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const GLASS_WIDTH = 140;
const GLASS_HEIGHT = 240;
const POUR_TILT_THRESHOLD = 0.35;

export default function PourScreen() {
  const router = useRouter();
  const [fillLevel, setFillLevel] = useState(0);
  const [phase, setPhase] = useState<'filling' | 'ready' | 'pouring' | 'done'>('filling');
  const [tiltX, setTiltX] = useState(0);

  // Phase 1: Auto-fill the glass
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

  // Phase 2 & 3: Accelerometer for pouring
  useEffect(() => {
    if (phase !== 'ready' && phase !== 'pouring') return;

    Accelerometer.setUpdateInterval(50);
    const subscription = Accelerometer.addListener(({ x }) => {
      setTiltX(x);
      const absTilt = Math.abs(x);

      if (absTilt > POUR_TILT_THRESHOLD) {
        setPhase('pouring');
        const pourRate = (absTilt - POUR_TILT_THRESHOLD) * 0.025;
        setFillLevel((prev) => {
          const next = prev - pourRate;
          if (next <= 0) {
            setPhase('done');
            return 0;
          }
          return next;
        });
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

  const fillHeight = fillLevel * (GLASS_HEIGHT - 24);
  const isPouring = phase === 'pouring' && fillLevel > 0;
  const tiltDeg = (phase === 'ready' || phase === 'pouring') ? tiltX * 25 : 0;
  const pouringRight = tiltX > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.topText}>
        {phase === 'filling' && 'Pouring...'}
        {phase === 'ready' && 'Tilt your phone to pour one out'}
        {phase === 'pouring' && 'Pouring one out...'}
        {phase === 'done' && 'One poured out. Cheers. 🍺'}
      </Text>

      {/* Glass + pour stream wrapper — rotates together so stream stays attached */}
      <View style={[styles.glassWrapper, { transform: [{ rotate: `${tiltDeg}deg` }] }]}>
        {/* Pour stream — attached to glass rim */}
        {isPouring && (
          <View
            style={[
              styles.pourStream,
              pouringRight
                ? { right: -6, top: -8 }
                : { left: -6, top: -8 },
            ]}
          />
        )}

        {/* Glass body */}
        <View style={styles.glass}>
          <View style={[styles.beerFill, { height: fillHeight }]} />
          {fillLevel > 0.08 && (
            <View style={[styles.foam, { bottom: fillHeight - 3 }]} />
          )}
          <View style={styles.glassShine} />
        </View>

        {/* Glass base */}
        <View style={styles.stem} />
        <View style={styles.base} />
      </View>

      {/* Splash puddle on the ground when pouring */}
      {isPouring && (
        <View
          style={[
            styles.puddle,
            {
              width: 40 + (1 - fillLevel) * 80,
              opacity: 0.4 + (1 - fillLevel) * 0.4,
            },
          ]}
        />
      )}

      <Pressable style={styles.skipButton} onPress={() => router.replace('/home')}>
        <Text style={styles.skipText}>Skip →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.brown,
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
  },
  glassWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  glass: {
    width: GLASS_WIDTH,
    height: GLASS_HEIGHT,
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderTopWidth: 0,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  beerFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.amber,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  foam: {
    position: 'absolute',
    left: 2,
    right: 2,
    height: 14,
    backgroundColor: '#FEF3C7',
    borderRadius: 7,
    opacity: 0.9,
  },
  glassShine: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 3,
    height: '70%',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
  },
  stem: {
    width: 14,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  base: {
    width: 80,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 4,
  },
  pourStream: {
    position: 'absolute',
    width: 12,
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: colors.amber,
    opacity: 0.75,
    borderRadius: 6,
  },
  puddle: {
    height: 12,
    backgroundColor: colors.amber,
    borderRadius: 20,
    marginTop: spacing.sm,
  },
  skipButton: {
    position: 'absolute',
    bottom: 60,
    right: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  skipText: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
