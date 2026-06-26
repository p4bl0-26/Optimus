import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { Zap, CheckCircle2, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Action Center',
  description: 'Prepared actions awaiting your approval',
}

export default function ActionsPage() {
  return (
    <PageContainer id="actions-page">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-lg font-bold text-[var(--color-text-primary)] mb-0.5"
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
        >
          Action Center
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          OPTIMUS prepares actions. You review and approve.
        </p>
      </div>



      {/* Feature explanation grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            icon: Zap,
            title: 'OPTIMUS Prepares',
            desc: 'AI generates responses, fills forms, and drafts emails on your behalf',
            color: 'var(--color-accent-primary)',
          },
          {
            icon: Clock,
            title: 'You Review',
            desc: 'Actions wait for your explicit approval before anything is submitted',
            color: 'var(--color-risk-monitor)',
          },
          {
            icon: CheckCircle2,
            title: 'Action Taken',
            desc: 'Approved actions are executed and tracked against your obligations',
            color: 'var(--color-risk-safe)',
          },
        ].map((item) => (
          <div key={item.title} className="intel-card p-4 flex flex-col gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}
            >
              <item.icon size={16} strokeWidth={1.5} style={{ color: item.color }} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text-primary)] mb-0.5">{item.title}</p>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="intel-card flex flex-col items-center justify-center p-14 text-center">
        <div
          className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
          style={{ background: 'var(--color-accent-glow)', border: '1px solid rgba(0,245,102,0.2)' }}
        >
          <Zap size={24} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
          No Actions Pending
        </p>
        <p className="text-[12px] text-[var(--color-text-muted)] max-w-[260px] leading-relaxed">
          When OPTIMUS detects obligations at risk, it will automatically prepare
          actions and surface them here for your review.
        </p>
      </div>
    </PageContainer>
  )
}
