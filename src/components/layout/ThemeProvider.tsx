'use client'

// ============================================================
// OPTIMUS — ThemeProvider
// Wraps next-themes with correct config for OPTIMUS
// ============================================================

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange={false}
      themes={['dark', 'light']}
    >
      {children}
    </NextThemesProvider>
  )
}
