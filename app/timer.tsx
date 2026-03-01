import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, fontSize, shadows, emboss } from '../src/theme';
import { saveColdOneTime, formatTimerDisplay } from '../src/utils/storage';
import ScreenBackground from '../src/components/ScreenBackground';
import Button from '../src/components/Button';
import Card from '../src/components/Card';
import { BeerIcon } from '../src/components/icons/RecipeIcons';

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
        'Cold One Saved!',
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
      <ScreenBackground>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <BeerIcon size={64} />
            <Text style={styles.heading}>Enter Your Cold One Time</Text>
            <Text style={styles.hint}>How long does it take you to drink a beer?</Text>

            <View style={styles.manualInputRow}>
              <View style={styles.inputGroup}>
                <Card variant="inset" style={styles.inputCard}>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.gray}
                    value={manualMinutes}
                    onChangeText={setManualMinutes}
                    maxLength={2}
                  />
                </Card>
                <Text style={styles.inputLabel}>min</Text>
              </View>
              <Text style={styles.colon}>:</Text>
              <View style={styles.inputGroup}>
                <Card variant="inset" style={styles.inputCard}>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    placeholder="00"
                    placeholderTextColor={colors.gray}
                    value={manualSeconds}
                    onChangeText={setManualSeconds}
                    maxLength={2}
                  />
                </Card>
                <Text style={styles.inputLabel}>sec</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button title="Save Cold One Time" onPress={saveManualTime} />
            </View>
            <Button
              title="Use stopwatch instead"
              variant="secondary"
              onPress={() => setShowManual(false)}
              style={styles.linkBtn}
            />
          </View>
        </TouchableWithoutFeedback>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.container}>
        <BeerIcon size={64} />
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

        <Card variant="inset" style={styles.timerCard}>
          <Text style={styles.timerDisplay}>{formatTimerDisplay(elapsed)}</Text>
        </Card>

        <View style={styles.buttonContainer}>
          {timerState === 'idle' && (
            <Button title="Start Drinking" variant="success" onPress={startTimer} />
          )}
          {timerState === 'running' && (
            <Button title="Done!" variant="danger" onPress={stopTimer} />
          )}
          {timerState === 'stopped' && (
            <>
              <Button title="Save as My Cold One" onPress={() => saveTime(elapsed)} />
              <Button title="Try Again" variant="secondary" onPress={resetTimer} />
            </>
          )}
        </View>

        {timerState === 'idle' && (
          <Button
            title="Enter time manually instead"
            variant="secondary"
            onPress={() => setShowManual(true)}
            style={styles.linkBtn}
          />
        )}
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
  heading: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.brown,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.md,
    color: colors.grayDark,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  timerCard: {
    width: '100%',
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: colors.brown,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  linkBtn: {
    marginTop: spacing.sm,
    ...shadows.sm,
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
  inputCard: {
    padding: 0,
  },
  timeInput: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.brown,
    textAlign: 'center',
    width: 100,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
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
