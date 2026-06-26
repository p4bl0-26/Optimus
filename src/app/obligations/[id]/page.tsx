import Link from 'next/link'
import { PageContainer } from '@/components/layout/PageContainer'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { obligationRepo, riskProfileRepo, interventionRepo, agentActivityRepo, agentMemoryRepo } from '@/lib/repositories'
import { Shield, Target, AlertTriangle, Clock, ArrowRight, Zap, Activity, Mail, Calendar, GraduationCap, ChevronRight, Brain } from 'lucide-react'

// Helper for deterministic confidence
function getChiefConfidence(riskScore: number) {
  if (riskScore >= 85) return 92;
  if (riskScore >= 70) return 88;
  if (riskScore >= 50) return 82;
  return 75;
}

export default async function ObligationDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  // Fetch from Supabase via Repository
  const obligation = await obligationRepo.findById(resolvedParams.id)
  
  if (!obligation) {
    return (
      <PageContainer id="obligation-not-found">
        <div className="flex flex-col items-center justify-center h-[60vh] max-w-md mx-auto text-center border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 rounded-sm shadow-2xl">
          <AlertTriangle size={32} className="text-[var(--color-risk-critical)] mb-4" />
          <h1 className="text-xl font-bold font-orbitron text-[var(--color-text-primary)] mb-2 uppercase tracking-widest">
            OBLIGATION NOT FOUND
          </h1>
          <div className="h-px w-full bg-[var(--color-border-subtle)] my-4" />
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            OPTIMUS cannot locate this intelligence object.
          </p>
          <div className="text-xs text-[var(--color-text-muted)] text-left w-full mb-6 bg-[var(--color-bg-base)] p-4 rounded-sm border border-[var(--color-border-subtle)]">
            <p className="mb-2 uppercase tracking-wider font-semibold">It may have been:</p>
            <ul className="space-y-1 ml-2">
              <li>• archived</li>
              <li>• resolved</li>
              <li>• removed from operational memory</li>
            </ul>
          </div>
          <Link href="/" className="px-6 py-2 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)] text-sm font-bold uppercase tracking-wider transition-colors duration-200">
            [ Return to Command Center ]
          </Link>
        </div>
      </PageContainer>
    )
  }

  // Fetch linked intelligence layers
  const [riskProfile, interventions, activities, allMemories] = await Promise.all([
    riskProfileRepo.findByObligation(obligation.id),
    interventionRepo.findAll({ obligation_id: obligation.id }),
    agentActivityRepo.findAll({ obligation_id: obligation.id }),
    agentMemoryRepo.findAll({ user_id: obligation.user_id })
  ])

  // Filter memories
  const relevantMemories = allMemories.filter(m => {
    const contentStr = JSON.stringify(m.content || {}).toLowerCase();
    return contentStr.includes(obligation.title.toLowerCase()) || m.memory_type === obligation.type;
  })

  // Provide fallback safe data if risk profile is missing
  const risk = {
    band: riskProfile?.risk_band || 'Safe',
    score: riskProfile?.risk_score || 0,
    reasoning: riskProfile?.reasoning || 'Awaiting initial analysis.',
    recommendedFocus: riskProfile?.recommended_focus || 'Monitor and proceed.',
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

  const dueDateFormatted = obligation.due_date 
    ? new Date(obligation.due_date).toLocaleDateString('en-US', { weekday: 'long', hour: '2-digit', minute: '2-digit' })
    : 'No deadline'

  // Sort interventions
  const severityOrder: Record<string, number> = { Critical: 1, 'High Risk': 2, Monitor: 3, Safe: 4 }
  const sortedInterventions = [...interventions].sort((a, b) => (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99))

  return (
    <PageContainer id="obligation-detail-page">
      {/* 3. OBLIGATION HEADER */}
      <div className="mb-6 intel-card p-6 border-l-4" style={{ borderLeftColor: riskColor }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-4 font-orbitron uppercase tracking-wide">
              {obligation.title}
            </h1>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Source</p>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] capitalize">{obligation.source}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Status</p>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] capitalize">{obligation.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Priority</p>
                <p className="text-xs font-semibold text-[var(--color-text-primary)] capitalize">{obligation.priority}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Due Date</p>
                <p className="text-xs font-semibold text-[var(--color-text-primary)]">{dueDateFormatted}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6 bg-[var(--color-bg-base)] p-4 border border-[var(--color-border-subtle)]">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Risk Score</p>
              <p className="text-4xl font-bold font-orbitron leading-none" style={{ color: riskColor }}>
                {risk.score}
              </p>
            </div>
            <div className="text-center px-4 py-2 border border-[var(--color-border)]" style={{ backgroundColor: `${riskColor}15` }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: riskColor }}>
                {risk.band}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Analysis & Context */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 4. EXECUTIVE ANALYSIS CARD */}
          <SectionContainer title="Executive Analysis" spacing="none">
            <div className="intel-card overflow-hidden">
              <div className="p-5 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]">
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider mb-2 flex items-center gap-2">
                  <AlertTriangle size={12} className="text-[var(--color-risk-critical)]" />
                  Why is this dangerous?
                </p>
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                  {risk.reasoning}
                </p>
              </div>
              
              <div className="p-5 space-y-4 bg-[var(--color-bg-elevated)]">
                {outcomes.map((outcome: any, i: number) => {
                  let label = 'UNKNOWN OUTCOME'
                  let outColor = 'var(--color-text-muted)'
                  
                  if (outcome.type === 'Recommended') { label = 'BEST OUTCOME'; outColor = 'var(--color-risk-safe)'; }
                  else if (outcome.type === 'Current') { label = 'MOST LIKELY OUTCOME'; outColor = 'var(--color-risk-monitor)'; }
                  else if (outcome.type === 'Danger') { label = 'WORST OUTCOME'; outColor = 'var(--color-risk-critical)'; }
                  
                  return (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm border border-[var(--color-border)] gap-4 bg-[var(--color-bg-base)] hover:border-[var(--color-border-subtle)] transition-colors">
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase mb-1 flex items-center gap-2 tracking-widest" style={{ color: outColor }}>
                          {outcome.type === 'Recommended' && <Target size={12} />}
                          {outcome.type === 'Current' && <Activity size={12} />}
                          {outcome.type === 'Danger' && <AlertTriangle size={12} />}
                          {label}
                        </p>
                        <p className="text-[13px] text-[var(--color-text-secondary)]">{outcome.summary}</p>
                      </div>
                      <div className="text-right flex-shrink-0 min-w-[80px]">
                        <p className="text-xl font-bold font-orbitron" style={{ color: outColor }}>{outcome.successProbability}%</p>
                        <p className="text-[9px] text-[var(--color-text-muted)] uppercase tracking-wider mt-1">Success Rate</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </SectionContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 7. RELATED SIGNALS */}
            <SectionContainer title="Intelligence Signals" spacing="none">
              <div className="intel-card p-4 min-h-[200px]">
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((act) => {
                      let icon = <Activity size={14} />
                      let title = 'System Event'
                      if (act.agent_name === 'gmail_agent') { icon = <Mail size={14} className="text-red-400" />; title = 'Gmail'; }
                      else if (act.agent_name === 'calendar_agent') { icon = <Calendar size={14} className="text-blue-400" />; title = 'Calendar'; }
                      else if (act.agent_name === 'classroom_agent') { icon = <GraduationCap size={14} className="text-green-400" />; title = 'Classroom'; }
                      
                      return (
                        <div key={act.id} className="flex gap-3 items-start p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border-subtle)] rounded-sm">
                          <div className="mt-0.5">{icon}</div>
                          <div>
                            <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">{title}</p>
                            <p className="text-xs text-[var(--color-text-primary)]">{act.metadata?.subject || act.action}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[var(--color-text-muted)] italic">No external signals detected for this obligation.</p>
                )}
              </div>
            </SectionContainer>

            {/* 8. MEMORY CONTEXT */}
            <SectionContainer title="Historical Patterns" spacing="none">
              <div className="intel-card p-4 min-h-[200px] bg-[var(--color-bg-secondary)] border-t-2 border-t-[var(--color-accent-primary)]">
                {relevantMemories.length > 0 ? (
                  <div className="space-y-4">
                    {relevantMemories.map((mem) => (
                      <div key={mem.id} className="flex gap-3 items-start">
                        <Brain size={14} className="text-[var(--color-accent-primary)] mt-0.5 shrink-0" />
                        <p className="text-xs text-[var(--color-text-primary)] leading-relaxed italic">
                          &quot;{mem.content?.pattern || mem.content?.observation || mem.content?.summary || 'User behaviour pattern recognized.'}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center py-6">
                    <Brain size={24} className="text-[var(--color-text-muted)] mb-3 opacity-50" />
                    <p className="text-xs text-[var(--color-text-secondary)] italic">
                      No historical patterns detected.<br/><br/>
                      <span className="text-[10px] text-[var(--color-text-muted)] uppercase not-italic">OPTIMUS will continue observing behavioural trends.</span>
                    </p>
                  </div>
                )}
              </div>
            </SectionContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: Actions & Rescue */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* 6. CHIEF RECOMMENDATION */}
          <SectionContainer title="Chief Recommendation" spacing="none">
            <div className="intel-card border border-[var(--color-accent-primary)] overflow-hidden">
              <div className="bg-[var(--color-accent-glow)] p-4 flex justify-between items-center border-b border-[var(--color-accent-primary)]/30">
                <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> Today&apos;s Focus
                </p>
                <div className="text-right">
                  <span className="text-sm font-bold font-orbitron text-[var(--color-text-primary)]">{getChiefConfidence(risk.score)}%</span>
                  <p className="text-[8px] uppercase tracking-wider text-[var(--color-text-muted)]">Confidence</p>
                </div>
              </div>
              <div className="p-5 bg-[var(--color-bg-elevated)]">
                <p className="text-sm font-medium text-[var(--color-text-primary)] leading-relaxed">
                  {risk.recommendedFocus}
                </p>
              </div>
            </div>
          </SectionContainer>

          {/* 5. AI RESCUE PLAN */}
          <SectionContainer title="Strategic Sequence" spacing="none">
            <div className="intel-card p-0 overflow-hidden">
              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-base)]">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Clock size={12} /> Day 1
                </p>
                <ul className="space-y-2 mt-3">
                  {rescuePlan.actions.today.length > 0 ? rescuePlan.actions.today.map((action: string, i: number) => (
                    <li key={i} className="text-[11px] text-[var(--color-text-primary)] flex items-start gap-2 bg-[var(--color-bg-elevated)] p-2 rounded-sm border border-[var(--color-border-subtle)]">
                      <Zap size={12} className="text-[var(--color-accent-primary)] mt-0.5 flex-shrink-0" />
                      {action}
                    </li>
                  )) : (
                    <li className="text-[11px] text-[var(--color-text-muted)] italic pl-1">No immediate actions required on Day 1.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <ChevronRight size={12} /> Day 2
                </p>
                <ul className="space-y-2 mt-3">
                  {rescuePlan.actions.tomorrow.length > 0 ? rescuePlan.actions.tomorrow.map((action: string, i: number) => (
                    <li key={i} className="text-[11px] text-[var(--color-text-secondary)] flex items-start gap-2 p-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-disabled)] mt-1 flex-shrink-0" />
                      {action}
                    </li>
                  )) : (
                    <li className="text-[11px] text-[var(--color-text-muted)] italic pl-1">No actions queued for Day 2.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-[var(--color-bg-base)]">
                <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <ChevronRight size={12} /> Day 3
                </p>
                <ul className="space-y-2 mt-3">
                  {rescuePlan.actions.beforeDeadline.length > 0 ? rescuePlan.actions.beforeDeadline.map((action: string, i: number) => (
                    <li key={i} className="text-[11px] text-[var(--color-text-secondary)] flex items-start gap-2 p-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-disabled)] mt-1 flex-shrink-0" />
                      {action}
                    </li>
                  )) : (
                    <li className="text-[11px] text-[var(--color-text-muted)] italic pl-1">No prerequisite actions mapped.</li>
                  )}
                </ul>
              </div>
            </div>
          </SectionContainer>

          {/* 9. ACTION CENTER (Filtered) */}
          {sortedInterventions.length > 0 && (
            <SectionContainer title="Action Center" spacing="none">
              <div className="space-y-3">
                {sortedInterventions.map((inv) => {
                  const sColor = {
                    Safe: 'var(--color-risk-safe)',
                    Monitor: 'var(--color-risk-monitor)',
                    'High Risk': 'var(--color-risk-high)',
                    Critical: 'var(--color-risk-critical)'
                  }[inv.severity] || 'var(--color-text-secondary)'

                  return (
                    <div key={inv.id} className="intel-card p-4 hover:border-[var(--color-border-subtle)] transition-colors border-l-2" style={{ borderLeftColor: sColor }}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider" style={{ color: sColor, backgroundColor: `${sColor}15` }}>
                          {inv.severity}
                        </span>
                        <span className="text-[9px] text-[var(--color-text-muted)] uppercase">{inv.type}</span>
                      </div>
                      <p className="text-xs text-[var(--color-text-primary)] font-medium leading-relaxed">
                        {inv.message}
                      </p>
                    </div>
                  )
                })}
              </div>
            </SectionContainer>
          )}

        </div>
      </div>
    </PageContainer>
  )
}
