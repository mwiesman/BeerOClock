import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize } from '../src/theme';
import { getColdOneTime, formatColdOnes, toColdOnes } from '../src/utils/storage';
import { recipes, Recipe } from '../src/data/recipes';

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

    return (
      <Pressable
        style={styles.recipeCard}
        onPress={() => router.push(`/recipe/${item.id}`)}
      >
        <Text style={styles.recipeEmoji}>{item.imageEmoji}</Text>
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeName}>{item.name}</Text>
          <Text style={styles.recipeDesc} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.timeRow}>
            <Text style={styles.realTime}>{item.totalTimeMinutes} min</Text>
            {coldOnes !== null && (
              <Text style={styles.coldOneTime}>
                🍺 {formatColdOnes(coldOnes)}
              </Text>
            )}
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {!coldOneTime && (
        <Pressable
          style={styles.calibrateBar}
          onPress={() => router.push('/timer')}
        >
          <Text style={styles.calibrateText}>
            ⏱️ Time a Cold One to see recipe times in Cold Ones!
          </Text>
        </Pressable>
      )}
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipe}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  calibrateBar: {
    backgroundColor: colors.amberLight,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  calibrateText: {
    color: colors.brown,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  recipeCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.grayLight,
  },
  recipeEmoji: {
    fontSize: 36,
    marginRight: spacing.md,
    width: 44,
    textAlign: 'center',
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
  chevron: {
    fontSize: 24,
    color: colors.gray,
    marginLeft: spacing.sm,
  },
});
