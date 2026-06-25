import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { BrainCircuit } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Intelligence',
  description: 'AI Memory and System Intelligence',
}

export default function IntelligencePage() {
  return (
    <PageContainer id="intelligence-page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-lg font-bold text-[var(--color-text-primary)] mb-0.5"
            style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
          >
            System Intelligence
          </h1>
          <p className="text-[13px] text-[var(--color-text-muted)]">
            AI Memory, Reasoning Logs, and Decision History
          </p>
        </div>
      </div>

      <div className="intel-card flex flex-col items-center justify-center p-16 text-center mt-2">
        <div
          className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
          style={{ background: 'var(--color-accent-glow)', border: '1px solid rgba(0,245,102,0.2)' }}
        >
          <BrainCircuit size={24} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
          Intelligence Module Offline
        </p>
        <p className="text-[12px] text-[var(--color-text-muted)] max-w-[280px] leading-relaxed">
          The deep reasoning memory logs and system intelligence center are reserved for future architectural phases.
        </p>
        <div
          className="mt-6 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wider
            border border-[var(--color-border)] text-[var(--color-text-muted)] uppercase"
        >
          Placeholder Route
        </div>
      </div>
    </PageContainer>
  )
}
