import { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { colors, spacing, fontSize, shadows } from '../src/theme';
import { getColdOneTime, formatTime } from '../src/utils/storage';
import ScreenBackground from '../src/components/ScreenBackground';
import Button from '../src/components/Button';
import Card from '../src/components/Card';
import { BeerIcon } from '../src/components/icons/RecipeIcons';

export default function HomeScreen() {
  const router = useRouter();
  const [coldOneTime, setColdOneTime] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      getColdOneTime().then(setColdOneTime);
    }, [])
  );

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <BeerIcon size={80} />
        <Text style={styles.title}>Beer O'Clock</Text>
        <Text style={styles.subtitle}>Cooking time, measured in Cold Ones</Text>

        {coldOneTime ? (
          <Card style={styles.coldOneCard}>
            <View style={styles.coldOneInner}>
              <Text style={styles.coldOneLabel}>Your Cold One</Text>
              <Text style={styles.coldOneValue}>{formatTime(coldOneTime)}</Text>
              <Button
                title="Recalibrate"
                variant="secondary"
                onPress={() => router.push('/timer')}
                style={styles.recalibrateBtn}
                textStyle={styles.recalibrateBtnText}
              />
            </View>
          </Card>
        ) : (
          <Card style={styles.coldOneCard}>
            <View style={styles.coldOneInner}>
              <Text style={styles.coldOneLabel}>No Cold One time set</Text>
              <Text style={styles.coldOneHint}>
                Time yourself drinking a beer to get started
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={coldOneTime ? 'Time Another Cold One' : 'Time a Cold One'}
            onPress={() => router.push('/timer')}
          />
          <Button
            title="Recipes"
            variant="dark"
            onPress={() => router.push('/recipes')}
          />
          <Button
            title="Settings"
            variant="secondary"
            onPress={() => router.push('/settings')}
          />
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize.hero,
    fontWeight: 'bold',
    color: colors.brown,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  coldOneCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  coldOneInner: {
    alignItems: 'center',
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
  recalibrateBtn: {
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  recalibrateBtnText: {
    fontSize: fontSize.sm,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
});
