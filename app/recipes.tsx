import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize, shadows, emboss } from '../src/theme';
import { getColdOneTime, formatColdOnes, toColdOnes } from '../src/utils/storage';
import { recipes, Recipe } from '../src/data/recipes';
import { recipeIconMap, BeerIcon } from '../src/components/icons/RecipeIcons';
import ScreenBackground from '../src/components/ScreenBackground';
import Card from '../src/components/Card';
import Button from '../src/components/Button';

export default function RecipesScreen() {
  const router = useRouter();
  const [coldOneTime, setColdOneTime] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      getColdOneTime().then(setColdOneTime);
    }, [])
  );

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const coldOnes = coldOneTime ? toColdOnes(item.totalTimeMinutes, coldOneTime) : null;
    const IconComponent = recipeIconMap[item.icon] || BeerIcon;

    return (
      <Pressable
        onPress={() => router.push(`/recipe/${item.id}`)}
        style={({ pressed }) => [pressed && styles.cardPressed]}
      >
        <Card style={styles.recipeCard}>
          <View style={styles.recipeRow}>
            <View style={styles.iconWrap}>
              <IconComponent size={44} />
            </View>
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName}>{item.name}</Text>
              <Text style={styles.recipeDesc} numberOfLines={1}>
                {item.description}
              </Text>
              <View style={styles.timeRow}>
                <Text style={styles.realTime}>{item.totalTimeMinutes} min</Text>
                {coldOnes !== null && (
                  <Text style={styles.coldOneTime}>
                    {formatColdOnes(coldOnes)}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.chevronWrap}>
              <Text style={styles.chevron}>&rsaquo;</Text>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <ScreenBackground>
      {!coldOneTime && (
        <Button
          title="Time a Cold One to see recipe times in Cold Ones!"
          onPress={() => router.push('/timer')}
          style={styles.calibrateBar}
          textStyle={styles.calibrateText}
        />
      )}
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  calibrateBar: {
    backgroundColor: colors.amberDark,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    ...emboss.subtle,
  },
  calibrateText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  recipeCard: {
    marginBottom: 0,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  recipeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    marginRight: spacing.md,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: fontSize.md,
    fontWeight: 'bold',
    color: colors.brown,
    marginBottom: 2,
  },
  recipeDesc: {
    fontSize: fontSize.sm,
    color: colors.grayDark,
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  realTime: {
    fontSize: fontSize.sm,
    color: colors.gray,
  },
  coldOneTime: {
    fontSize: fontSize.sm,
    color: colors.amber,
    fontWeight: '600',
  },
  chevronWrap: {
    marginLeft: spacing.sm,
  },
  chevron: {
    fontSize: 28,
    color: colors.amberDark,
    fontWeight: '300',
  },
});
