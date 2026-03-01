import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize } from '../src/theme';
import { saveColdOneTime, formatTimerDisplay } from '../src/utils/storage';

type TimerState = 'idle' | 'running' | 'stopped';

export default function TimerScreen() {
  const router = useRouter();
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [showManual, setShowManual] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  const [manualSeconds, setManualSeconds] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  const startTimer = useCallback(() => {
    setTimerState('running');
    startTimeRef.current = Date.now() - elapsed * 1000;
    intervalRef.current = setInterval(() => {
      setElapsed((Date.now() - startTimeRef.current) / 1000);
    }, 100);
  }, [elapsed]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState('stopped');
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState('idle');
    setElapsed(0);
  }, []);

  const saveTime = useCallback(
    async (seconds: number) => {
      if (seconds < 1) {
        Alert.alert('Too Fast!', "That's impossibly fast. Try again!");
        return;
      }
      await saveColdOneTime(seconds);
      Alert.alert(
        'Cold One Saved! 🍺',
        `Your Cold One is ${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`,
        [{ text: 'Nice!', onPress: () => router.back() }]
      );
    },
    [router]
  );

  const saveManualTime = useCallback(() => {
    const mins = parseInt(manualMinutes, 10) || 0;
    const secs = Math.min(parseInt(manualSeconds, 10) || 0, 59);
    const total = mins * 60 + secs;
    saveTime(total);
  }, [manualMinutes, manualSeconds, saveTime]);

  if (showManual) {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.emoji}>⏱️</Text>
          <Text style={styles.heading}>Enter Your Cold One Time</Text>
          <Text style={styles.hint}>How long does it take you to drink a beer?</Text>

          <View style={styles.manualInputRow}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.gray}
                value={manualMinutes}
                onChangeText={setManualMinutes}
                maxLength={2}
              />
              <Text style={styles.inputLabel}>min</Text>
            </View>
            <Text style={styles.colon}>:</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.timeInput}
                keyboardType="number-pad"
                placeholder="00"
                placeholderTextColor={colors.gray}
                value={manualSeconds}
                onChangeText={setManualSeconds}
                maxLength={2}
              />
              <Text style={styles.inputLabel}>sec</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.primaryButton} onPress={saveManualTime}>
              <Text style={styles.buttonText}>Save Cold One Time</Text>
            </Pressable>
          </View>
          <Pressable style={styles.linkButton} onPress={() => setShowManual(false)}>
            <Text style={styles.linkText}>Use stopwatch instead</Text>
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍺</Text>
      <Text style={styles.heading}>
        {timerState === 'idle' && 'Ready to Time a Cold One?'}
        {timerState === 'running' && 'Drink Up!'}
        {timerState === 'stopped' && 'Done!'}
      </Text>
      <Text style={styles.hint}>
        {timerState === 'idle' && 'Start the timer when you start drinking'}
        {timerState === 'running' && 'Stop when you finish your beer'}
        {timerState === 'stopped' && 'Save this as your Cold One time?'}
      </Text>

      <Text style={styles.timerDisplay}>{formatTimerDisplay(elapsed)}</Text>

      <View style={styles.buttonContainer}>
        {timerState === 'idle' && (
          <Pressable style={styles.startButton} onPress={startTimer}>
            <Text style={styles.buttonText}>Start Drinking</Text>
          </Pressable>
        )}
        {timerState === 'running' && (
          <Pressable style={styles.stopButton} onPress={stopTimer}>
            <Text style={styles.buttonText}>Done!</Text>
          </Pressable>
        )}
        {timerState === 'stopped' && (
          <>
            <Pressable style={styles.primaryButton} onPress={() => saveTime(elapsed)}>
              <Text style={styles.buttonText}>Save as My Cold One</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={resetTimer}>
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </Pressable>
          </>
        )}
      </View>

      {timerState === 'idle' && (
        <Pressable style={styles.linkButton} onPress={() => setShowManual(true)}>
          <Text style={styles.linkText}>Enter time manually instead</Text>
        </Pressable>
      )}
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
  heading: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.brown,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.brown,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  startButton: {
    backgroundColor: colors.green,
    paddingVertical: 18,
    paddingHorizontal: spacing.xl,
    borderRadius: 14,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: colors.red,
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
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  secondaryButton: {
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
  linkButton: {
    paddingVertical: spacing.md,
  },
  linkText: {
    color: colors.amber,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  inputGroup: {
    alignItems: 'center',
  },
  timeInput: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.amberLight,
    borderRadius: 12,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
    textAlign: 'center',
    width: 100,
    paddingVertical: spacing.md,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.grayDark,
    marginTop: spacing.xs,
  },
  colon: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
    marginBottom: spacing.lg,
  },
});
