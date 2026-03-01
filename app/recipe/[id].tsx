import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize, shadows } from '../../src/theme';
import { getColdOneTime, formatColdOnes, toColdOnes } from '../../src/utils/storage';
import { recipes } from '../../src/data/recipes';
import { recipeIconMap, BeerIcon } from '../../src/components/icons/RecipeIcons';
import ScreenBackground from '../../src/components/ScreenBackground';
import Card from '../../src/components/Card';
import Button from '../../src/components/Button';
import SectionHeader from '../../src/components/SectionHeader';

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
      <ScreenBackground>
        <View style={styles.centerContainer}>
          <Text style={styles.heading}>Recipe not found</Text>
        </View>
      </ScreenBackground>
    );
  }

  const IconComponent = recipeIconMap[recipe.icon] || BeerIcon;
  const totalColdOnes = coldOneTime
    ? toColdOnes(recipe.totalTimeMinutes, coldOneTime)
    : null;

  return (
    <ScreenBackground>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerArea}>
          <IconComponent size={80} />
          <Text style={styles.heading}>{recipe.name}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
        </View>

        <Card style={styles.timeCard}>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Total Time</Text>
              <Text style={styles.timeValue}>{recipe.totalTimeMinutes} min</Text>
            </View>
            {totalColdOnes !== null && (
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>In Cold Ones</Text>
                <Text style={styles.timeValueCold}>{formatColdOnes(totalColdOnes)}</Text>
              </View>
            )}
          </View>
        </Card>

        <SectionHeader title="Steps" />

        {recipe.steps.map((step, index) => (
          <Card key={index} style={styles.stepCard}>
            <View style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepInstruction}>{step.instruction}</Text>
                {step.timeMinutes !== undefined && (
                  <Text style={styles.stepTime}>
                    {step.timeMinutes} min
                    {coldOneTime &&
                      ` · ${formatColdOnes(toColdOnes(step.timeMinutes, coldOneTime))}`}
                  </Text>
                )}
              </View>
            </View>
          </Card>
        ))}

        <Button
          title="Start Grilling"
          variant="dark"
          onPress={() =>
            router.push({
              pathname: '/cook-timer',
              params: { recipeId: recipe.id },
            })
          }
          style={styles.grillButton}
        />
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  description: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  timeCard: {
    marginBottom: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
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
  stepCard: {
    marginBottom: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.amberDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    ...shadows.sm,
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
    marginTop: spacing.lg,
  },
});
