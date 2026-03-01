import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, shadows, emboss, gradients } from '../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'raised' | 'inset' | 'dark';
  style?: ViewStyle;
}

export default function Card({ children, variant = 'raised', style }: CardProps) {
  if (variant === 'dark') {
    return (
      <View style={[styles.outer, shadows.md, style]}>
        <LinearGradient
          colors={gradients.cardDark as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[styles.inner, emboss.raised]}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  if (variant === 'inset') {
    return (
      <View style={[styles.outer, styles.insetOuter, style]}>
        <View style={[styles.inner, styles.insetInner]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.outer, shadows.md, style]}>
      <LinearGradient
        colors={gradients.card as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.inner, emboss.raised]}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 10,
  },
  inner: {
    borderRadius: 10,
    padding: spacing.md,
  },
  insetOuter: {
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 10,
  },
  insetInner: {
    borderRadius: 10,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.5)',
  },
});
