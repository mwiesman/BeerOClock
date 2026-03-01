import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme';

interface SectionHeaderProps {
  title: string;
}

export default function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      <View style={styles.divider}>
        <View style={styles.dividerHighlight} />
        <View style={styles.dividerShadow} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.brownMedium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  divider: {
    height: 2,
  },
  dividerHighlight: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dividerShadow: {
    height: 1,
    backgroundColor: 'rgba(69, 26, 3, 0.15)',
  },
});
