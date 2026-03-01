import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  dark?: boolean;
}

export default function ScreenBackground({ children, dark }: ScreenBackgroundProps) {
  if (dark) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[colors.brown, '#2D1200']}
          style={styles.gradient}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={gradients.screen as [string, string]}
        style={styles.gradient}
      >
        {/* Subtle texture overlay via layered semi-transparent elements */}
        <View style={styles.textureOverlay} />
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(180, 160, 130, 0.03)',
  },
});
