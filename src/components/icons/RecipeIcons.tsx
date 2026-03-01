import { View, Text, StyleSheet } from 'react-native';
import GlossyIcon from '../GlossyIcon';
import { colors } from '../../theme';

interface IconProps {
  size?: number;
}

// Each icon uses a simple text glyph inside a glossy container.
// These can be replaced with SVG art later — just swap the inner content.

export function BurgerIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#D97706', '#92400E']}>
      <View style={styles.iconInner}>
        <View style={[styles.bunTop, { width: size * 0.55, height: size * 0.18 }]} />
        <View style={[styles.patty, { width: size * 0.6, height: size * 0.1 }]} />
        <View style={[styles.bunBottom, { width: size * 0.55, height: size * 0.12 }]} />
      </View>
    </GlossyIcon>
  );
}

export function SteakIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#DC2626', '#7F1D1D']}>
      <View style={styles.iconInner}>
        <View style={[styles.steak, {
          width: size * 0.5,
          height: size * 0.35,
          borderRadius: size * 0.15,
        }]} />
        <View style={[styles.steakMarble, {
          width: size * 0.2,
          height: 2,
          top: size * 0.02,
        }]} />
      </View>
    </GlossyIcon>
  );
}

export function ChickenIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#FCD34D', '#D97706']}>
      <View style={styles.iconInner}>
        <View style={[styles.drumstick, {
          width: size * 0.2,
          height: size * 0.35,
          borderRadius: size * 0.08,
        }]} />
        <View style={[styles.drumstickBall, {
          width: size * 0.3,
          height: size * 0.3,
          borderRadius: size * 0.15,
          bottom: size * 0.02,
        }]} />
      </View>
    </GlossyIcon>
  );
}

export function FishIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#60A5FA', '#1E40AF']}>
      <View style={styles.iconInner}>
        <View style={[styles.fishBody, {
          width: size * 0.5,
          height: size * 0.25,
          borderRadius: size * 0.12,
        }]} />
        <View style={[styles.fishTail, {
          width: 0,
          height: 0,
          borderLeftWidth: size * 0.12,
          borderTopWidth: size * 0.1,
          borderBottomWidth: size * 0.1,
          left: -(size * 0.08),
        }]} />
      </View>
    </GlossyIcon>
  );
}

export function HotDogIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#F59E0B', '#92400E']}>
      <View style={styles.iconInner}>
        <View style={[styles.hotdogBun, {
          width: size * 0.55,
          height: size * 0.25,
          borderRadius: size * 0.12,
        }]} />
        <View style={[styles.hotdogFrank, {
          width: size * 0.5,
          height: size * 0.12,
          borderRadius: size * 0.06,
        }]} />
      </View>
    </GlossyIcon>
  );
}

export function RibsIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#B45309', '#451A03']}>
      <View style={styles.iconInner}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.rib, {
              width: size * 0.5,
              height: size * 0.07,
              marginVertical: size * 0.02,
              borderRadius: size * 0.03,
            }]}
          />
        ))}
      </View>
    </GlossyIcon>
  );
}

export function CornIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#FCD34D', '#CA8A04']}>
      <View style={styles.iconInner}>
        <View style={[styles.cornCob, {
          width: size * 0.2,
          height: size * 0.5,
          borderRadius: size * 0.1,
        }]} />
        <View style={[styles.cornHusk, {
          width: size * 0.25,
          height: size * 0.2,
          borderRadius: size * 0.05,
          bottom: -(size * 0.05),
        }]} />
      </View>
    </GlossyIcon>
  );
}

export function VeggieIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#22C55E', '#15803D']}>
      <View style={styles.iconInner}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[styles.asparagus, {
              width: size * 0.06,
              height: size * 0.45,
              marginHorizontal: size * 0.02,
              borderRadius: size * 0.03,
            }]}
          />
        ))}
      </View>
    </GlossyIcon>
  );
}

export function FireIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#EF4444', '#991B1B']}>
      <View style={styles.iconInner}>
        <View style={[styles.flame, {
          width: size * 0.25,
          height: size * 0.4,
          borderRadius: size * 0.12,
          borderBottomLeftRadius: size * 0.04,
          borderBottomRightRadius: size * 0.04,
        }]} />
        <View style={[styles.flameInner, {
          width: size * 0.12,
          height: size * 0.2,
          borderRadius: size * 0.06,
          bottom: size * 0.02,
        }]} />
      </View>
    </GlossyIcon>
  );
}

export function BeerIcon({ size = 48 }: IconProps) {
  return (
    <GlossyIcon size={size} bgColors={['#F59E0B', '#78350F']}>
      <View style={styles.iconInner}>
        <View style={[styles.mugBody, {
          width: size * 0.3,
          height: size * 0.38,
          borderRadius: size * 0.04,
          borderBottomLeftRadius: size * 0.06,
          borderBottomRightRadius: size * 0.06,
        }]} />
        <View style={[styles.mugHandle, {
          width: size * 0.1,
          height: size * 0.2,
          borderRadius: size * 0.05,
          right: -(size * 0.06),
          borderWidth: size * 0.03,
        }]} />
        <View style={[styles.mugFoam, {
          width: size * 0.34,
          height: size * 0.08,
          borderRadius: size * 0.04,
          top: -(size * 0.02),
        }]} />
      </View>
    </GlossyIcon>
  );
}

// Map recipe icon names to components
export const recipeIconMap: Record<string, React.ComponentType<IconProps>> = {
  burger: BurgerIcon,
  steak: SteakIcon,
  chicken: ChickenIcon,
  fish: FishIcon,
  hotdog: HotDogIcon,
  ribs: RibsIcon,
  corn: CornIcon,
  veggie: VeggieIcon,
  fire: FireIcon,
  beer: BeerIcon,
};

const styles = StyleSheet.create({
  iconInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Burger
  bunTop: { backgroundColor: '#D4A056', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  patty: { backgroundColor: '#5C3A1E', marginVertical: 1 },
  bunBottom: { backgroundColor: '#C8923A', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  // Steak
  steak: { backgroundColor: '#9F1239', transform: [{ rotate: '-15deg' }] },
  steakMarble: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.4)' },
  // Chicken
  drumstick: { backgroundColor: '#92400E', position: 'absolute', top: 0 },
  drumstickBall: { backgroundColor: '#B45309', position: 'absolute' },
  // Fish
  fishBody: { backgroundColor: '#93C5FD' },
  fishTail: { position: 'absolute', backgroundColor: 'transparent', borderLeftColor: '#93C5FD', borderTopColor: 'transparent', borderBottomColor: 'transparent' },
  // Hot Dog
  hotdogBun: { backgroundColor: '#D4A056' },
  hotdogFrank: { position: 'absolute', backgroundColor: '#9F1239' },
  // Ribs
  rib: { backgroundColor: '#D4A056' },
  // Corn
  cornCob: { backgroundColor: '#FDE68A' },
  cornHusk: { position: 'absolute', backgroundColor: '#16A34A' },
  // Veggie
  asparagus: { backgroundColor: '#BBF7D0' },
  // Fire
  flame: { backgroundColor: '#FCD34D' },
  flameInner: { position: 'absolute', backgroundColor: '#FFFFFF', opacity: 0.6 },
  // Beer
  mugBody: { backgroundColor: '#FCD34D' },
  mugHandle: { position: 'absolute', backgroundColor: 'transparent', borderColor: '#FCD34D' },
  mugFoam: { position: 'absolute', backgroundColor: '#FFFFFF', opacity: 0.9 },
});
