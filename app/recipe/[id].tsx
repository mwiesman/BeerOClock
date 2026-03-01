import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize } from '../../src/theme';
import { getColdOneTime, formatColdOnes, toColdOnes } from '../../src/utils/storage';
import { recipes } from '../../src/data/recipes';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [coldOneTime, setColdOneTime] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      getColdOneTime().then(setColdOneTime);
    }, [])
  );

  const recipe = recipes.find((r) => r.id === id);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Recipe not found</Text>
      </View>
    );
  }

  const totalColdOnes = coldOneTime
    ? toColdOnes(recipe.totalTimeMinutes, coldOneTime)
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.emoji}>{recipe.imageEmoji}</Text>
      <Text style={styles.heading}>{recipe.name}</Text>
      <Text style={styles.description}>{recipe.description}</Text>

      <View style={styles.timeCard}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>Total Time</Text>
          <Text style={styles.timeValue}>{recipe.totalTimeMinutes} min</Text>
        </View>
        {totalColdOnes !== null && (
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>In Cold Ones</Text>
            <Text style={styles.timeValueCold}>🍺 {formatColdOnes(totalColdOnes)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.stepsTitle}>Steps</Text>
      {recipe.steps.map((step, index) => (
        <View key={index} style={styles.stepCard}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepInstruction}>{step.instruction}</Text>
            {step.timeMinutes !== undefined && (
              <Text style={styles.stepTime}>
                ⏱️ {step.timeMinutes} min
                {coldOneTime &&
                  ` · 🍺 ${formatColdOnes(toColdOnes(step.timeMinutes, coldOneTime))}`}
              </Text>
            )}
          </View>
        </View>
      ))}

      <Pressable
        style={styles.grillButton}
        onPress={() =>
          router.push({
            pathname: '/cook-timer',
            params: { recipeId: recipe.id },
          })
        }
      >
        <Text style={styles.grillButtonText}>🔥 Start Grilling</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  timeCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    width: '100%',
    borderWidth: 1,
    borderColor: colors.grayLight,
    marginBottom: spacing.lg,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: fontSize.sm,
    color: colors.gray,
    marginBottom: spacing.xs,
  },
  timeValue: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.brown,
  },
  timeValueCold: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.amber,
  },
  stepsTitle: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.brown,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  stepContent: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: fontSize.md,
    color: colors.black,
    lineHeight: 22,
  },
  stepTime: {
    fontSize: fontSize.sm,
    color: colors.amber,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  grillButton: {
    backgroundColor: colors.brown,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  grillButtonText: {
    color: colors.amber,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
});
