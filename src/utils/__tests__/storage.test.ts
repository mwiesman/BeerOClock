import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveColdOneTime,
  getColdOneTime,
  saveRemindersEnabled,
  getRemindersEnabled,
  saveGlassStyle,
  getGlassStyle,
  formatTime,
  formatTimerDisplay,
  toColdOnes,
  formatColdOnes,
} from '../storage';

// AsyncStorage is auto-mocked by jest-expo

beforeEach(() => {
  (AsyncStorage.clear as jest.Mock).mockClear();
  (AsyncStorage.setItem as jest.Mock).mockClear();
  (AsyncStorage.getItem as jest.Mock).mockClear();
});

// ─── Pure formatting functions ────────────────────────────

describe('formatTime', () => {
  it('formats seconds only when under a minute', () => {
    expect(formatTime(0)).toBe('0s');
    expect(formatTime(5)).toBe('5s');
    expect(formatTime(45)).toBe('45s');
    expect(formatTime(59.9)).toBe('59s');
  });

  it('formats minutes and seconds with zero-padded seconds', () => {
    expect(formatTime(60)).toBe('1m 00s');
    expect(formatTime(61)).toBe('1m 01s');
    expect(formatTime(90)).toBe('1m 30s');
    expect(formatTime(125)).toBe('2m 05s');
    expect(formatTime(3600)).toBe('60m 00s');
  });

  it('floors fractional seconds', () => {
    expect(formatTime(5.7)).toBe('5s');
    expect(formatTime(65.9)).toBe('1m 05s');
  });
});

describe('formatTimerDisplay', () => {
  it('formats as MM:SS.T with zero padding', () => {
    expect(formatTimerDisplay(0)).toBe('00:00.0');
    expect(formatTimerDisplay(5)).toBe('00:05.0');
    expect(formatTimerDisplay(65)).toBe('01:05.0');
    expect(formatTimerDisplay(600)).toBe('10:00.0');
  });

  it('includes tenths of a second', () => {
    // Note: 5.3 % 1 ≈ 0.2999 due to floating point, so floor gives 2
    expect(formatTimerDisplay(5.3)).toBe('00:05.2');
    expect(formatTimerDisplay(90.75)).toBe('01:30.7');
  });

  it('floors tenths correctly', () => {
    expect(formatTimerDisplay(1.99)).toBe('00:01.9');
  });
});

describe('toColdOnes', () => {
  it('converts cooking minutes to Cold One count', () => {
    // If a Cold One takes 60 seconds (1 min), 10 min = 10 Cold Ones
    expect(toColdOnes(10, 60)).toBe(10);
  });

  it('handles fractional Cold Ones', () => {
    // Cold One takes 120s (2 min), 5 min cooking = 2.5 Cold Ones
    expect(toColdOnes(5, 120)).toBe(2.5);
  });

  it('handles fast drinkers', () => {
    // 30 second Cold One, 15 min cooking = 30 Cold Ones
    expect(toColdOnes(15, 30)).toBe(30);
  });
});

describe('formatColdOnes', () => {
  it('returns "Less than half a Cold One" for small values', () => {
    expect(formatColdOnes(0)).toBe('Less than half a Cold One');
    expect(formatColdOnes(0.3)).toBe('Less than half a Cold One');
    expect(formatColdOnes(0.49)).toBe('Less than half a Cold One');
  });

  it('returns singular for exactly 1', () => {
    expect(formatColdOnes(1)).toBe('1 Cold One');
  });

  it('returns plural with one decimal for other values', () => {
    expect(formatColdOnes(0.5)).toBe('0.5 Cold Ones');
    expect(formatColdOnes(2)).toBe('2 Cold Ones');
    expect(formatColdOnes(3.7)).toBe('3.7 Cold Ones');
  });

  it('rounds to one decimal place', () => {
    expect(formatColdOnes(2.34)).toBe('2.3 Cold Ones');
    expect(formatColdOnes(2.35)).toBe('2.4 Cold Ones');
  });
});

// ─── AsyncStorage-backed functions ────────────────────────

describe('Cold One time storage', () => {
  it('saves and retrieves Cold One time', async () => {
    await saveColdOneTime(45.5);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('cold_one_seconds', '45.5');

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('45.5');
    const result = await getColdOneTime();
    expect(result).toBe(45.5);
  });

  it('returns null when no Cold One time is saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const result = await getColdOneTime();
    expect(result).toBeNull();
  });
});

describe('Reminders storage', () => {
  it('saves and retrieves reminders enabled state', async () => {
    await saveRemindersEnabled(false);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'cold_one_reminders_enabled',
      'false'
    );

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('false');
    const result = await getRemindersEnabled();
    expect(result).toBe(false);
  });

  it('defaults to true when nothing is saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    const result = await getRemindersEnabled();
    expect(result).toBe(true);
  });
});

describe('Glass style storage', () => {
  it('saves and retrieves glass style', async () => {
    await saveGlassStyle('mug');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('glass_style', 'mug');

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('mug');
    const result = await getGlassStyle();
    expect(result).toBe('mug');
  });

  it('returns all valid glass styles', async () => {
    for (const style of ['pint', 'mug', 'bottle', 'can', 'random'] as const) {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(style);
      expect(await getGlassStyle()).toBe(style);
    }
  });

  it('defaults to random for invalid values', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('goblet');
    expect(await getGlassStyle()).toBe('random');
  });

  it('defaults to random when nothing is saved', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    expect(await getGlassStyle()).toBe('random');
  });
});
