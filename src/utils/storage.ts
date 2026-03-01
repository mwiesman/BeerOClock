import AsyncStorage from '@react-native-async-storage/async-storage';

const COLD_ONE_KEY = 'cold_one_seconds';
const REMINDERS_KEY = 'cold_one_reminders_enabled';

export async function saveColdOneTime(seconds: number): Promise<void> {
  await AsyncStorage.setItem(COLD_ONE_KEY, seconds.toString());
}

export async function getColdOneTime(): Promise<number | null> {
  const value = await AsyncStorage.getItem(COLD_ONE_KEY);
  return value ? parseFloat(value) : null;
}

export async function saveRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(enabled));
}

export async function getRemindersEnabled(): Promise<boolean> {
  const value = await AsyncStorage.getItem(REMINDERS_KEY);
  return value === null ? true : JSON.parse(value);
}

export function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export function formatTimerDisplay(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const tenths = Math.floor((totalSeconds % 1) * 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`;
}

export function toColdOnes(timeMinutes: number, coldOneSeconds: number): number {
  const coldOneMinutes = coldOneSeconds / 60;
  return timeMinutes / coldOneMinutes;
}

export function formatColdOnes(count: number): string {
  if (count < 0.5) return 'Less than half a Cold One';
  const rounded = Math.round(count * 10) / 10;
  if (rounded === 1) return '1 Cold One';
  return `${rounded} Cold Ones`;
}
