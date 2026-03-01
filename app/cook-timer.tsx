import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, Vibration } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, fontSize, shadows } from '../src/theme';
import {
  getColdOneTime,
  formatTimerDisplay,
  formatColdOnes,
  toColdOnes,
  getRemindersEnabled,
} from '../src/utils/storage';
import { recipes, RecipeStep } from '../src/data/recipes';
import { recipeIconMap, BeerIcon, FireIcon } from '../src/components/icons/RecipeIcons';
import ScreenBackground from '../src/components/ScreenBackground';
import Button from '../src/components/Button';
import Card from '../src/components/Card';

type CookState = 'ready' | 'cooking' | 'paused' | 'step-done' | 'finished';

export default function CookTimerScreen() {
  const { recipeId } = useLocalSearchParams<{ recipeId: string }>();
  const router = useRouter();
  const recipe = recipes.find((r) => r.id === recipeId);

  const [coldOneTime, setColdOneTime] = useState<number | null>(null);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cookState, setCookState] = useState<CookState>('ready');
  const [remaining, setRemaining] = useState(0);

  // Global elapsed time across ALL steps for Cold One tracking
  const globalElapsedRef = useRef(0);
  const stepElapsedRef = useRef(0);
  const [coldOnesNotified, setColdOnesNotified] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const targetEndRef = useRef(0);
  const stepStartTimeRef = useRef(0);

  useEffect(() => {
    getColdOneTime().then(setColdOneTime);
    getRemindersEnabled().then(setRemindersEnabled);
  }, []);

  const currentStep: RecipeStep | undefined = recipe?.steps[currentStepIndex];
  const hasTimer = currentStep?.timeMinutes !== undefined;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const getCurrentColdOneNumber = useCallback(() => {
    if (!coldOneTime) return 0;
    const totalElapsed = globalElapsedRef.current + stepElapsedRef.current;
    return Math.floor(totalElapsed / coldOneTime);
  }, [coldOneTime]);

  const tick = useCallback(() => {
    const left = Math.max(0, (targetEndRef.current - Date.now()) / 1000);
    const stepTotal = currentStep?.timeMinutes ? currentStep.timeMinutes * 60 : 0;
    stepElapsedRef.current = stepTotal - left;
    setRemaining(left);
    if (left <= 0) {
      clearTimer();
      Vibration.vibrate([0, 500, 200, 500]);
      globalElapsedRef.current += stepElapsedRef.current;
      stepElapsedRef.current = 0;
      setCookState('step-done');
    }
  }, [currentStep, clearTimer]);

  const startStep = useCallback(() => {
    if (!currentStep?.timeMinutes) {
      setCookState('step-done');
      return;
    }
    const totalSeconds = currentStep.timeMinutes * 60;
    setRemaining(totalSeconds);
    stepElapsedRef.current = 0;
    targetEndRef.current = Date.now() + totalSeconds * 1000;
    stepStartTimeRef.current = Date.now();

    setCookState('cooking');
    intervalRef.current = setInterval(tick, 100);
  }, [currentStep, tick]);

  const pauseTimer = useCallback(() => {
    clearTimer();
    setCookState('paused');
  }, [clearTimer]);

  const resumeTimer = useCallback(() => {
    targetEndRef.current = Date.now() + remaining * 1000;
    setCookState('cooking');
    intervalRef.current = setInterval(tick, 100);
  }, [remaining, tick]);

  // Cold One reminders that carry across steps
  useEffect(() => {
    if (cookState !== 'cooking' || !coldOneTime || !remindersEnabled) return;
    const currentColdOnes = getCurrentColdOneNumber();
    if (currentColdOnes > coldOnesNotified) {
      setColdOnesNotified(currentColdOnes);
      Vibration.vibrate(200);
      Alert.alert(
        `Cold One #${currentColdOnes + 1}!`,
        'Time to crack open another one!'
      );
    }
  }, [remaining, coldOneTime, coldOnesNotified, cookState, remindersEnabled, getCurrentColdOneNumber]);

  const nextStep = useCallback(() => {
    if (!recipe) return;
    clearTimer();
    if (currentStepIndex < recipe.steps.length - 1) {
      setCurrentStepIndex((i) => i + 1);
      setCookState('ready');
    } else {
      setCookState('finished');
    }
  }, [recipe, currentStepIndex, clearTimer]);

  const confirmQuit = useCallback(() => {
    Alert.alert(
      'Quit Cooking?',
      'Your timer progress will be lost.',
      [
        { text: 'Keep Cooking', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: () => {
            clearTimer();
            router.back();
          },
        },
      ]
    );
  }, [clearTimer, router]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  if (!recipe) {
    return (
      <ScreenBackground>
        <View style={styles.container}>
          <Text style={styles.heading}>Recipe not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </ScreenBackground>
    );
  }

  const IconComponent = recipeIconMap[recipe.icon] || BeerIcon;
  const totalColdOnes = coldOneTime
    ? toColdOnes(recipe.totalTimeMinutes, coldOneTime)
    : null;

  const displayColdOne = coldOneTime
    ? Math.floor((globalElapsedRef.current + stepElapsedRef.current) / coldOneTime) + 1
    : null;

  if (cookState === 'finished') {
    return (
      <ScreenBackground>
        <View style={styles.container}>
          <FireIcon size={80} />
          <Text style={styles.heading}>Done!</Text>
          <Text style={styles.subtext}>
            Your {recipe.name} is ready!
          </Text>
          {totalColdOnes !== null && (
            <Card style={styles.summaryCard}>
              <View style={styles.summaryInner}>
                <BeerIcon size={36} />
                <Text style={styles.coldOneSummary}>
                  That was about {formatColdOnes(totalColdOnes)}
                </Text>
              </View>
            </Card>
          )}
          <Button title="Back to Home" onPress={() => router.dismissAll()} />
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        {/* Quit button */}
        <View style={styles.quitWrap}>
          <Button
            title="Quit"
            variant="secondary"
            onPress={confirmQuit}
            style={styles.quitButton}
            textStyle={styles.quitText}
          />
        </View>

        <Text style={styles.progressText}>
          Step {currentStepIndex + 1} of {recipe.steps.length}
        </Text>

        <Card style={styles.stepCard}>
          <View style={styles.stepInner}>
            <IconComponent size={48} />
            <Text style={styles.stepInstruction}>{currentStep?.instruction}</Text>
          </View>
        </Card>

        {hasTimer && cookState !== 'ready' && (
          <Card variant="inset" style={styles.timerCard}>
            <Text style={styles.timerDisplay}>{formatTimerDisplay(remaining)}</Text>
          </Card>
        )}

        {displayColdOne && coldOneTime && cookState === 'cooking' && remindersEnabled && (
          <View style={styles.coldOneRow}>
            <BeerIcon size={24} />
            <Text style={styles.coldOneTracker}>
              Cold One #{displayColdOne}
            </Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          {cookState === 'ready' && (
            <Button
              title={hasTimer ? `Start (${currentStep?.timeMinutes} min)` : 'Done with this step'}
              variant="success"
              onPress={startStep}
            />
          )}
          {cookState === 'cooking' && (
            <Button title="Pause" variant="primary" onPress={pauseTimer} />
          )}
          {cookState === 'paused' && (
            <>
              <Button title="Resume" variant="success" onPress={resumeTimer} />
              <Button title="Skip Step" variant="secondary" onPress={nextStep} />
            </>
          )}
          {cookState === 'step-done' && (
            <Button
              title={currentStepIndex < recipe.steps.length - 1 ? 'Next Step' : 'Finish!'}
              onPress={nextStep}
            />
          )}
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
  quitWrap: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  quitButton: {
    ...shadows.sm,
  },
  quitText: {
    fontSize: fontSize.sm,
  },
  progressText: {
    fontSize: fontSize.md,
    color: colors.brownMedium,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  stepCard: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  stepInner: {
    alignItems: 'center',
  },
  stepInstruction: {
    fontSize: fontSize.lg,
    color: colors.brown,
    textAlign: 'center',
    lineHeight: 28,
    marginTop: spacing.md,
  },
  timerCard: {
    width: '100%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.brown,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  coldOneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  coldOneTracker: {
    fontSize: fontSize.lg,
    color: colors.amber,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  subtext: {
    fontSize: fontSize.lg,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.xl,
    width: '100%',
  },
  summaryInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  coldOneSummary: {
    fontSize: fontSize.xl,
    color: colors.amber,
    fontWeight: 'bold',
  },
});
