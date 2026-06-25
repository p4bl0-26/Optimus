import type { Metadata } from 'next'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { FileText, Sun, Moon, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Briefings',
  description: 'Morning, evening, and critical intelligence briefings',
}

const BRIEFING_TYPES = [
  {
    id: 'morning',
    icon: Sun,
    label: 'Morning Briefing',
    time: 'Daily at 7:00 AM',
    desc: "Here's your plan for the day. 3 priorities · 1 risk",
    color: 'var(--color-risk-monitor)',
    emoji: '☀️',
  },
  {
    id: 'evening',
    icon: Moon,
    label: 'Evening Briefing',
    time: 'Daily at 8:00 PM',
    desc: "Here's what happened today. 2 done · 1 pending",
    color: 'var(--color-accent-secondary)',
    emoji: '🌙',
  },
  {
    id: 'critical',
    icon: AlertTriangle,
    label: 'Critical Briefing',
    time: 'Triggered by risk threshold',
    desc: 'Immediate attention required. High risk detected.',
    color: 'var(--color-risk-critical)',
    emoji: '🚨',
  },
]

export default function BriefingsPage() {
  return (
    <PageContainer id="briefings-page">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-lg font-bold text-[var(--color-text-primary)] mb-0.5"
          style={{ fontFamily: 'var(--font-orbitron, Orbitron, sans-serif)' }}
        >
          Briefings
        </h1>
        <p className="text-[13px] text-[var(--color-text-muted)]">
          AI-generated intelligence briefings — morning, evening, and critical alerts
        </p>
      </div>

      {/* Briefing type cards */}
      <SectionContainer title="Briefing Types" spacing="md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BRIEFING_TYPES.map((type) => (
            <div
              key={type.id}
              id={`briefing-type-${type.id}`}
              className="intel-card p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${type.color}15`, border: `1px solid ${type.color}30` }}
                >
                  <type.icon size={14} strokeWidth={1.5} style={{ color: type.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[var(--color-text-primary)]">
                    {type.emoji} {type.label}
                  </p>
                  <p className="text-[10px] text-[var(--color-text-muted)]">{type.time}</p>
                </div>
              </div>
              <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                {type.desc}
              </p>
              {/* Preview slot */}
              <div
                className="mt-3 px-2 py-1.5 rounded text-[10px] text-[var(--color-text-muted)] border"
                style={{ borderColor: `${type.color}20`, background: `${type.color}06` }}
              >
                No briefings generated yet
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>

      {/* Briefing history empty state */}
      <SectionContainer title="Briefing History">
        <div className="intel-card flex flex-col items-center justify-center p-14 text-center">
          <div
            className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
            style={{ background: 'var(--color-accent-glow)', border: '1px solid rgba(0,245,102,0.2)' }}
          >
            <FileText size={24} className="text-[var(--color-accent-primary)]" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-2">
            No Briefings Yet
          </p>
          <p className="text-[12px] text-[var(--color-text-muted)] max-w-[260px] leading-relaxed">
            Once your obligations are connected, OPTIMUS will generate morning and
            evening briefings and alert you when critical risks are detected.
          </p>
        </div>
      </SectionContainer>
    </PageContainer>
  )
}
