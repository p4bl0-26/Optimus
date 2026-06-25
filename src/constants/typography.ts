// ============================================================
// OPTIMUS — Typography Constants
// Orbitron: Logo, headings, command-center labels
// Inter: Body, data, supporting text
// ============================================================

export const FONTS = {
  heading: 'var(--font-orbitron)',
  body: 'var(--font-inter)',
} as const

export const FONT_SIZES = {
  xs: '0.625rem',    // 10px — meta labels
  sm: '0.75rem',     // 12px — secondary text
  base: '0.875rem',  // 14px — body
  md: '1rem',        // 16px — default
  lg: '1.125rem',    // 18px — subheadings
  xl: '1.25rem',     // 20px — section headers
  '2xl': '1.5rem',   // 24px — page titles
  '3xl': '1.875rem', // 30px — display
  '4xl': '2.25rem',  // 36px — hero
} as const

export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const

export const LINE_HEIGHTS = {
  tight: '1.2',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
} as const

export const LETTER_SPACINGS = {
  tight: '-0.02em',
  normal: '0',
  wide: '0.05em',
  wider: '0.1em',
  widest: '0.15em',  // for Orbitron uppercase labels
} as const
