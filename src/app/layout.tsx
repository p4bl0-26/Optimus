import type { Metadata, Viewport } from 'next'
import { Orbitron, Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { AppShell } from '@/components/layout/AppShell'
import { StartupWrapper } from '@/components/layout/StartupWrapper'
import { SplashProvider } from '@/contexts/SplashContext'

// ─── Fonts ───────────────────────────────────────────────────
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// ─── Metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'OPTIMUS — AI Chief of Staff',
    template: '%s | OPTIMUS',
  },
  description:
    'OPTIMUS is an AI Chief of Staff that proactively discovers obligations, predicts failure risks, generates execution plans, and intervenes before important commitments are missed.',
  keywords: [
    'AI Chief of Staff',
    'obligation management',
    'deadline intelligence',
    'risk prediction',
    'executive dashboard',
    'commitment tracking',
  ],
  authors: [{ name: 'OPTIMUS' }],
  creator: 'OPTIMUS',
  metadataBase: new URL('https://optimus.ai'),
  openGraph: {
    type: 'website',
    title: 'OPTIMUS — AI Chief of Staff',
    description: 'Predict. Plan. Prevent.',
    siteName: 'OPTIMUS',
  },
  icons: {
    icon: '/optimus-logo.png',
    shortcut: '/optimus-logo.png',
    apple: '/optimus-logo.png',
  },
  robots: {
    index: false, // Private app — don't index
    follow: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080F0C' },
    { media: '(prefers-color-scheme: light)', color: '#F5F0E8' },
  ],
  width: 'device-width',
  initialScale: 1,
}

// ─── Root Layout ─────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${orbitron.variable} ${inter.variable}`}
    >
      <body>
        <ThemeProvider>
          <SplashProvider>
            <StartupWrapper>
              <AppShell>{children}</AppShell>
            </StartupWrapper>
          </SplashProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
