import { RiskBand } from '@/types'

// ============================================================
// OPTIMUS Core Color Palette
// Provides specific hex values, semantic tokens are in CSS
// ============================================================

export const THEME_COLORS = {
  // Brand & Accents
  accent: {
    primary: '#00F566',
    secondary: '#22C05E',
    tertiary: '#1A7A3C',
    glow: 'rgba(0, 245, 102, 0.15)',
  },
  
  // Base Surface Colors (Dark Theme Default)
  surface: {
    primary: '#080F0C',
    secondary: '#0D1A12',
    elevated: '#111D16',
    overlay: 'rgba(8, 15, 12, 0.92)',
  },

  // Typography
  text: {
    primary: '#E8F5EC',
    secondary: '#8BAF96',
    muted: '#4A7A5C',
    disabled: '#2A4A35',
  },

  // Borders & Dividers
  border: {
    default: '#1E3024',
    subtle: '#162219',
    focus: '#00F566',
  },

  // Interactive States
  state: {
    hover: 'rgba(232, 245, 236, 0.05)',
    active: 'rgba(232, 245, 236, 0.1)',
    focusRing: 'rgba(0, 245, 102, 0.4)',
  }
}

// ─── Risk Band Colors ─────────────────────────────────────────
// Locked thresholds: 0-40 Safe, 41-70 Monitor, 71-85 High Risk, 86-100 Critical
export const RISK_COLORS: Record<RiskBand, { bg: string; text: string; border: string; badge: string }> = {
  Safe: {
    bg: '#00F56612',
    text: '#00F566',
    border: '#00F56630',
    badge: '#00F56620',
  },
  Monitor: {
    bg: '#FFD70012',
    text: '#FFD700',
    border: '#FFD70030',
    badge: '#FFD70020',
  },
  'High Risk': {
    bg: '#FF6B0012',
    text: '#FF6B00',
    border: '#FF6B0030',
    badge: '#FF6B0020',
  },
  Critical: {
    bg: '#FF3B3012',
    text: '#FF3B30',
    border: '#FF3B3030',
    badge: '#FF3B3020',
  },
}

export const RISK_LABELS: Record<RiskBand, string> = {
  Safe: 'Safe',
  Monitor: 'Monitor',
  'High Risk': 'High Risk',
  Critical: 'Critical',
}
