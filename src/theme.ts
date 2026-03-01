import { Platform } from 'react-native';

export const colors = {
  amber: '#F59E0B',
  amberLight: '#FCD34D',
  amberDark: '#D97706',
  amberDeep: '#B45309',
  brown: '#451A03',
  brownMedium: '#78350F',
  brownLight: '#92400E',
  cream: '#FFFBEB',
  creamDark: '#FEF3C7',
  white: '#FFFFFF',
  offWhite: '#FFF9ED',
  black: '#1C1917',
  gray: '#A8A29E',
  grayLight: '#E7E5E4',
  grayDark: '#57534E',
  red: '#EF4444',
  redDark: '#DC2626',
  green: '#22C55E',
  greenDark: '#16A34A',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  hero: 48,
};

// Warm brown-tinted shadows (never gray)
const SHADOW_COLOR = '#451A03';

export const shadows = {
  sm: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    ...Platform.select({ android: { elevation: 3 } }),
  },
  md: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    ...Platform.select({ android: { elevation: 6 } }),
  },
  lg: {
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    ...Platform.select({ android: { elevation: 10 } }),
  },
  inset: {
    // Used as border styling to simulate inset shadow
    borderTopColor: 'rgba(0,0,0,0.08)',
    borderLeftColor: 'rgba(0,0,0,0.05)',
    borderBottomColor: 'rgba(255,255,255,0.4)',
    borderRightColor: 'rgba(255,255,255,0.3)',
  },
};

// Gradient color arrays for LinearGradient
export const gradients = {
  button: [colors.amberLight, colors.amber, colors.amberDark],
  buttonPressed: [colors.amberDark, colors.amber, colors.amberLight],
  buttonDanger: [colors.red, colors.redDark],
  buttonSuccess: [colors.green, colors.greenDark],
  buttonSecondary: [colors.grayLight, '#D6D3D1'],
  buttonDark: [colors.brownMedium, colors.brown],
  card: [colors.white, colors.offWhite],
  cardDark: [colors.brownMedium, colors.brown],
  header: ['#5C2D0E', colors.brown],
  screen: [colors.cream, colors.creamDark],
};

// Emboss highlight border for raised elements
export const emboss = {
  raised: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderLeftColor: 'rgba(255,255,255,0.25)',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.15)',
    borderRightColor: 'rgba(0,0,0,0.08)',
  },
  subtle: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
};
