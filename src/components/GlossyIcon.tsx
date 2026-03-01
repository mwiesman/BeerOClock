import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { shadows } from '../theme';

interface GlossyIconProps {
  children: React.ReactNode;
  size?: number;
  bgColors?: [string, string];
}

export default function GlossyIcon({
  children,
  size = 48,
  bgColors = ['#F59E0B', '#B45309'],
}: GlossyIconProps) {
  const borderRadius = size * 0.22; // iPod Touch icon radius ratio

  return (
    <View style={[styles.container, shadows.sm, { width: size, height: size, borderRadius }]}>
      <LinearGradient
        colors={bgColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.background, { borderRadius }]}
      >
        {/* Gloss highlight overlay */}
        <LinearGradient
          colors={['rgba(255,255,255,0.45)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.gloss, { borderRadius, height: size * 0.5 }]}
        />
        <View style={styles.iconContent}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  background: {
    flex: 1,
    overflow: 'hidden',
  },
  gloss: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  iconContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
