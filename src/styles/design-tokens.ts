export const DESIGN_TOKENS = {
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
  },
  card: {
    padding: '24px',
    radius: '16px',
    headerGap: '16px',
  },
  layout: {
    sectionGap: '24px',
    columnGap: '20px',
  },
  button: {
    height: '48px',
    paddingX: '20px',
    radius: '12px',
    transition: '250ms',
  },
  border: '1px solid rgba(118,192,67,0.15)',
  shadow: {
    default: 'none',
    hover: '0 0 24px rgba(118,192,67,0.08)',
    active: '0 0 32px rgba(118,192,67,0.12)',
  },
  colors: {
    background: '#090909',
    card: '#101010',
    cardHover: '#141414',
    textPrimary: '#E8E8E8',
    textSecondary: '#A0A0A0',
    textMuted: '#6B6B6B',
    success: '#76C043',
    warning: '#F59E0B',
    critical: '#EF4444',
  },
  typography: {
    sizes: {
      pageTitle: '44px',
      sectionTitle: '24px',
      cardTitle: '18px',
      body: '15px',
      caption: '13px',
    },
    lineHeights: {
      headings: '1.2',
      body: '1.5',
    },
  },
  motion: {
    fast: '150ms',
    normal: '250ms',
    large: '400ms',
  }
} as const;
