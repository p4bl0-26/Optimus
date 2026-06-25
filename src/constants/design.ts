// ============================================================
// OPTIMUS — Design Token Constants
// Border radius, shadows, spacing, z-index
// ============================================================

export const RADIUS = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
} as const

export const SHADOWS = {
  // Dark theme shadows — green-tinted
  dark: {
    sm: '0 1px 3px rgba(0, 245, 102, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 245, 102, 0.06)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.6), 0 2px 6px rgba(0, 245, 102, 0.08)',
    xl: '0 16px 48px rgba(0, 0, 0, 0.8), 0 4px 12px rgba(0, 245, 102, 0.1)',
    glow: '0 0 20px rgba(0, 245, 102, 0.15), 0 0 60px rgba(0, 245, 102, 0.05)',
    glowSm: '0 0 8px rgba(0, 245, 102, 0.2)',
  },
  // Light theme shadows — neutral warm
  light: {
    sm: '0 1px 3px rgba(26, 46, 32, 0.06)',
    md: '0 4px 12px rgba(26, 46, 32, 0.08), 0 1px 3px rgba(26, 46, 32, 0.04)',
    lg: '0 8px 24px rgba(26, 46, 32, 0.10), 0 2px 6px rgba(26, 46, 32, 0.06)',
    xl: '0 16px 48px rgba(26, 46, 32, 0.12), 0 4px 12px rgba(26, 46, 32, 0.08)',
    glow: '0 0 20px rgba(26, 122, 60, 0.10)',
    glowSm: '0 0 8px rgba(26, 122, 60, 0.15)',
  },
} as const

export const SPACING = {
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const

export const Z_INDEX = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  overlay: 300,
  modal: 400,
  tooltip: 500,
} as const

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Sidebar dimensions
export const SIDEBAR = {
  width: '240px',
  collapsedWidth: '64px',
  mobileBreakpoint: 768,
} as const

// Utility panel dimensions
export const UTILITY_PANEL = {
  width: '340px',
  minWidth: '280px',
} as const

// Transition durations
export const TRANSITIONS = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  xslow: '400ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const
