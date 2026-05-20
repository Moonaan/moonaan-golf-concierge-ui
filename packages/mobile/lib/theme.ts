export const colors = {
  primary: '#1B4D3E',
  primaryLight: '#2D6B4F',
  accent: '#C4A35A',
  background: '#0F2E23',
  surface: '#163B2E',
  surfaceLight: '#1E4F3D',
  text: '#FFFFFF',
  textSecondary: '#A8C5B8',
  textMuted: '#6B9B87',
  success: '#4CAF50',
  error: '#EF5350',
  warning: '#FFB74D',
  border: '#1E4F3D',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 32,
  hero: 40,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
} as const;

const theme = { colors, spacing, borderRadius, fontSize, shadows };
export default theme;
