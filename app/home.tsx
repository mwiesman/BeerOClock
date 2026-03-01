import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize } from '../src/theme';
import { getColdOneTime, formatTime } from '../src/utils/storage';

export default function HomeScreen() {
  const router = useRouter();
  const [coldOneTime, setColdOneTime] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      getColdOneTime().then(setColdOneTime);
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍺</Text>
      <Text style={styles.title}>Beer O'Clock</Text>
      <Text style={styles.subtitle}>Cooking time, measured in Cold Ones</Text>

      {coldOneTime ? (
        <View style={styles.coldOneCard}>
          <Text style={styles.coldOneLabel}>Your Cold One</Text>
          <Text style={styles.coldOneValue}>{formatTime(coldOneTime)}</Text>
          <Pressable
            style={styles.recalibrateButton}
            onPress={() => router.push('/timer')}
          >
            <Text style={styles.recalibrateText}>Recalibrate</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.coldOneCard}>
          <Text style={styles.coldOneLabel}>No Cold One time set</Text>
          <Text style={styles.coldOneHint}>
            Time yourself drinking a beer to get started
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push('/timer')}
        >
          <Text style={styles.buttonText}>
            {coldOneTime ? '🍺 Time Another Cold One' : '🍺 Time a Cold One'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.recipesButton}
          onPress={() => router.push('/recipes')}
        >
          <Text style={styles.buttonText}>🔥 Recipes</Text>
        </Pressable>

        <Pressable
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsText}>⚙️ Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.cream,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.brown,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  coldOneCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.amberLight,
  },
  coldOneLabel: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    marginBottom: spacing.xs,
  },
  coldOneValue: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
  },
  coldOneHint: {
    fontSize: fontSize.sm,
    color: colors.gray,
    textAlign: 'center',
  },
  recalibrateButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  recalibrateText: {
    fontSize: fontSize.sm,
    color: colors.amber,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.amber,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  recipesButton: {
    backgroundColor: colors.brown,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  settingsButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  settingsText: {
    color: colors.grayDark,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
