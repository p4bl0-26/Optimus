import { notFound } from 'next/navigation'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { obligationRepo, riskProfileRepo } from '@/lib/repositories'
import { Shield, Target, AlertTriangle, Clock, ArrowRight, Zap, Activity } from 'lucide-react'

// Note: Next.js 15 async page props for dynamic params
export default async function ObligationDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  // Fetch from Supabase via Repository
  const obligation = await obligationRepo.findById(resolvedParams.id)
  
  if (!obligation) {
    notFound()
  }

  // Fetch Risk Profile from Supabase
  const riskProfile = await riskProfileRepo.findByObligation(obligation.id)

  // Provide fallback safe data if risk profile is missing
  const risk = {
    band: riskProfile?.risk_band || 'Safe',
    score: riskProfile?.risk_score || 0,
    reasoning: riskProfile?.reasoning || 'Awaiting initial analysis.',
    recommendedFocus: riskProfile?.recommended_focus || 'Monitor and proceed.',
    factors: riskProfile?.future_outcomes?.factors || [],
    missingWork: riskProfile?.missing_work ? [riskProfile.missing_work] : []
  }

  // Future outcomes mapped directly from jsonb
  const outcomes = riskProfile?.future_outcomes?.outcomes || [
    { type: 'Current', summary: 'On trajectory', successProbability: 80 }
  ]

  // Rescue plan mapped directly from jsonb
  const rescuePlan = riskProfile?.future_outcomes?.rescuePlan || {
    actions: { today: [], tomorrow: [], beforeDeadline: [] }
  }

  // Helper colors
  const riskColor = {
    Safe: 'var(--color-risk-safe)',
    Monitor: 'var(--color-risk-monitor)',
    'High Risk': 'var(--color-risk-high)',
    Critical: 'var(--color-risk-critical)',
  }[risk.band] || 'var(--color-text-primary)'

  // eslint-disable-next-line react-hooks/purity
  const hoursRemaining = Math.max(0, Math.ceil((new Date(obligation.due_date || Date.now()).getTime() - Date.now()) / (1000 * 60 * 60)))

  return (
    <PageContainer id="obligation-detail-page">
      {/* HEADER: Decision Briefing */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[var(--color-border-subtle)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-text-muted)]">
              Obligation Profile
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border" style={{ color: riskColor, borderColor: `${riskColor}40`, backgroundColor: `${riskColor}10` }}>
              {risk.band}
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase border border-[var(--color-border)] text-[var(--color-text-secondary)]">
              Priority: {obligation.priority}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 font-orbitron">
            {obligation.title}
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] max-w-2xl">
            {obligation.description || 'No detailed description provided.'}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Risk Score</p>
            <p className="text-3xl font-bold font-orbitron" style={{ color: riskColor }}>
              {risk.score}<span className="text-lg text-[var(--color-text-muted)]">%</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Time Remaining</p>
            <p className="text-3xl font-bold font-orbitron text-[var(--color-text-primary)] flex items-center gap-1 justify-end">
              {hoursRemaining}<span className="text-lg text-[var(--color-text-muted)]">H</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* LEFT COLUMN: Analysis & Outcomes */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Executive Summary */}
          <SectionContainer title="Executive Analysis" spacing="none">
            <div className="intel-card p-5" style={{ borderLeft: `3px solid ${riskColor}` }}>
              <p className="text-[13px] text-[var(--color-text-primary)] leading-relaxed mb-4">
                {risk.reasoning}
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--color-border-subtle)]">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} /> Primary Risk Factors
                  </p>
                  <ul className="space-y-1.5">
                    {risk.factors.length > 0 ? risk.factors.map((f: string, i: number) => (
                      <li key={i} className="text-[11px] text-[var(--color-text-secondary)] flex items-start gap-1.5">
                        <span className="text-[var(--color-accent-primary)] mt-0.5">•</span> {f}
                      </li>
                    )) : (
                      <li className="text-[11px] text-[var(--color-text-muted)]">No distinct risk factors identified.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2 flex items-center gap-1.5">
                    <Target size={12} /> Missing Capabilities
                  </p>
                  <ul className="space-y-1.5">
                    {risk.missingWork.length > 0 ? risk.missingWork.map((w: string, i: number) => (
                      <li key={i} className="text-[11px] text-[var(--color-text-secondary)] flex items-start gap-1.5">
                        <span className="text-[var(--color-risk-high)] mt-0.5">•</span> {w}
                      </li>
                    )) : (
                      <li className="text-[11px] text-[var(--color-text-muted)]">All components presently available.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </SectionContainer>

          {/* Future Outcomes */}
          <SectionContainer title="Future Outcomes Engine" spacing="none">
            <div className="intel-card p-5">
              <div className="space-y-3">
                {outcomes.map((outcome: any, i: number) => {
                  const outColor = outcome.type === 'Recommended' ? 'var(--color-risk-safe)' : 
                                  outcome.type === 'Current' ? 'var(--color-risk-monitor)' : 'var(--color-risk-critical)'
                  const bgStyle = outcome.type === 'Recommended' ? { backgroundColor: 'var(--color-risk-safe-bg)', borderColor: 'var(--color-risk-safe-border)' } : {}
                  
                  return (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border border-[var(--color-border)] gap-4" style={bgStyle}>
                      <div className="flex-1">
                        <p className="text-[11px] font-bold uppercase mb-0.5 flex items-center gap-1.5" style={{ color: outColor }}>
                          {outcome.type === 'Recommended' && <Target size={12} />}
                          {outcome.type === 'Current' && <Activity size={12} />}
                          {outcome.type === 'Danger' && <AlertTriangle size={12} />}
                          {outcome.type} Path
                        </p>
                        <p className="text-[11px] text-[var(--color-text-secondary)]">{outcome.summary}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold font-orbitron" style={{ color: outColor }}>{outcome.successProbability}%</p>
                        <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider">Success Rate</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </SectionContainer>
        </div>

        {/* RIGHT COLUMN: Rescue Plan & Actions */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Action Focus */}
          <SectionContainer title="Recommended Focus" spacing="none">
            <div className="intel-card p-4 bg-[var(--color-bg-secondary)]">
              <p className="text-[12px] font-medium text-[var(--color-text-primary)]">
                {risk.recommendedFocus}
              </p>
            </div>
          </SectionContainer>

          {/* Rescue Plan */}
          <SectionContainer title="Rescue Plan" spacing="none">
            <div className="intel-card p-0 overflow-hidden">
              <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Clock size={12} /> Today
                </p>
                <ul className="space-y-1.5 mt-2">
                  {rescuePlan.actions.today.length > 0 ? rescuePlan.actions.today.map((action: string, i: number) => (
                    <li key={i} className="text-[11px] text-[var(--color-text-primary)] flex items-start gap-2">
                      <Zap size={12} className="text-[var(--color-accent-primary)] mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  )) : (
                    <li className="text-[11px] text-[var(--color-text-muted)]">No immediate actions required today.</li>
                  )}
                </ul>
              </div>

              <div className="p-3 border-b border-[var(--color-border)]">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                  Tomorrow
                </p>
                <ul className="space-y-1.5 mt-2">
                  {rescuePlan.actions.tomorrow.length > 0 ? rescuePlan.actions.tomorrow.map((action: string, i: number) => (
                    <li key={i} className="text-[11px] text-[var(--color-text-secondary)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-disabled)] mt-1 flex-shrink-0" />
                      {action}
                    </li>
                  )) : (
                    <li className="text-[11px] text-[var(--color-text-muted)]">No actions queued for tomorrow.</li>
                  )}
                </ul>
              </div>

              <div className="p-3">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                  Before Deadline
                </p>
                <ul className="space-y-1.5 mt-2">
                  {rescuePlan.actions.beforeDeadline.length > 0 ? rescuePlan.actions.beforeDeadline.map((action: string, i: number) => (
                    <li key={i} className="text-[11px] text-[var(--color-text-secondary)] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-disabled)] mt-1 flex-shrink-0" />
                      {action}
                    </li>
                  )) : (
                    <li className="text-[11px] text-[var(--color-text-muted)]">No prerequisite actions mapped.</li>
                  )}
                </ul>
              </div>
            </div>
          </SectionContainer>
        </div>
      </div>
    </PageContainer>
  )
}
