import { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, Vibration } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, fontSize } from '../src/theme';
import {
  getColdOneTime,
  formatTimerDisplay,
  formatColdOnes,
  toColdOnes,
  getRemindersEnabled,
} from '../src/utils/storage';
import { recipes, RecipeStep } from '../src/data/recipes';

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

  // Calculate current Cold One number based on total elapsed time
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
      // Commit this step's elapsed time to global total
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
        `🍺 Cold One #${currentColdOnes + 1}!`,
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
      <View style={styles.container}>
        <Text style={styles.heading}>Recipe not found</Text>
        <Pressable style={styles.primaryButton} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const totalColdOnes = coldOneTime
    ? toColdOnes(recipe.totalTimeMinutes, coldOneTime)
    : null;

  // Current Cold One number for display
  const displayColdOne = coldOneTime
    ? Math.floor((globalElapsedRef.current + stepElapsedRef.current) / coldOneTime) + 1
    : null;

  if (cookState === 'finished') {
    return (
      <View style={styles.container}>
        <Text style={styles.bigEmoji}>🎉</Text>
        <Text style={styles.heading}>Done!</Text>
        <Text style={styles.subtext}>
          Your {recipe.name} is ready!
        </Text>
        {totalColdOnes !== null && (
          <Text style={styles.coldOneSummary}>
            🍺 That was about {formatColdOnes(totalColdOnes)}
          </Text>
        )}
        <Pressable style={styles.primaryButton} onPress={() => router.dismissAll()}>
          <Text style={styles.primaryButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Quit button */}
      <Pressable style={styles.quitButton} onPress={confirmQuit}>
        <Text style={styles.quitButtonText}>✕ Quit</Text>
      </Pressable>

      <Text style={styles.progressText}>
        Step {currentStepIndex + 1} of {recipe.steps.length}
      </Text>

      <View style={styles.stepCard}>
        <Text style={styles.stepEmoji}>{recipe.imageEmoji}</Text>
        <Text style={styles.stepInstruction}>{currentStep?.instruction}</Text>
      </View>

      {hasTimer && cookState !== 'ready' && (
        <Text style={styles.timerDisplay}>{formatTimerDisplay(remaining)}</Text>
      )}

      {displayColdOne && coldOneTime && cookState === 'cooking' && remindersEnabled && (
        <Text style={styles.coldOneTracker}>
          🍺 Cold One #{displayColdOne}
        </Text>
      )}

      <View style={styles.buttonContainer}>
        {cookState === 'ready' && (
          <Pressable style={styles.startButton} onPress={startStep}>
            <Text style={styles.primaryButtonText}>
              {hasTimer ? `Start (${currentStep?.timeMinutes} min)` : 'Done with this step'}
            </Text>
          </Pressable>
        )}
        {cookState === 'cooking' && (
          <Pressable style={styles.pauseButton} onPress={pauseTimer}>
            <Text style={styles.primaryButtonText}>Pause</Text>
          </Pressable>
        )}
        {cookState === 'paused' && (
          <>
            <Pressable style={styles.startButton} onPress={resumeTimer}>
              <Text style={styles.primaryButtonText}>Resume</Text>
            </Pressable>
            <Pressable style={styles.skipButton} onPress={nextStep}>
              <Text style={styles.secondaryButtonText}>Skip Step</Text>
            </Pressable>
          </>
        )}
        {cookState === 'step-done' && (
          <Pressable style={styles.primaryButton} onPress={nextStep}>
            <Text style={styles.primaryButtonText}>
              {currentStepIndex < recipe.steps.length - 1 ? 'Next Step →' : 'Finish! 🎉'}
            </Text>
          </Pressable>
        )}
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
  quitButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  quitButtonText: {
    color: colors.grayDark,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  progressText: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    marginBottom: spacing.md,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.amberLight,
  },
  stepEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  stepInstruction: {
    fontSize: fontSize.lg,
    color: colors.brown,
    textAlign: 'center',
    lineHeight: 28,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.brown,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.md,
  },
  coldOneTracker: {
    fontSize: fontSize.lg,
    color: colors.amber,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  startButton: {
    backgroundColor: colors.green,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: colors.amberDark,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.amber,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: colors.grayLight,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.grayDark,
    fontSize: fontSize.lg,
    fontWeight: '600',
  },
  heading: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
    marginBottom: spacing.md,
  },
  subtext: {
    fontSize: fontSize.lg,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  coldOneSummary: {
    fontSize: fontSize.xl,
    color: colors.amber,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  bigEmoji: {
    fontSize: 100,
    marginBottom: spacing.md,
  },
});
