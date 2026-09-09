export const colors = {
  background: '#0B0E14',
  surface: '#141824',
  surfaceElevated: '#1E2336',
  surfaceElevatedHover: '#282F48',
  primaryText: '#F8FAFC',
  secondaryText: '#94A3B8',
  tertiaryText: '#64748B',
  positive: '#10B981',
  positiveMuted: 'rgba(16, 185, 129, 0.15)',
  negative: '#EF4444',
  negativeMuted: 'rgba(239, 68, 68, 0.15)',
  border: '#262C40',
  borderHighlight: '#3B4466',
  accent: '#6366F1',
  accentMuted: 'rgba(99, 102, 241, 0.15)',
  accentGlow: 'rgba(99, 102, 241, 0.3)',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.8,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
  },
  mono: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums' as const],
  },
  monoLarge: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: -1,
    fontVariant: ['tabular-nums' as const],
  },
};
