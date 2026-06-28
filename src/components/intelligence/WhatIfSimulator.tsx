'use client'

import { useState, useEffect, useTransition } from 'react'
import { simulateWhatIfAction } from '@/app/actions/simulation'
import { ImportanceLevel, RiskAnalysis, FutureOutcome } from '@/types'
import { Activity, Clock } from 'lucide-react'

interface WhatIfSimulatorProps {
  deadline: Date
  importance: ImportanceLevel
  currentProgress: number
}

export function WhatIfSimulator({ deadline, importance, currentProgress }: WhatIfSimulatorProps) {
  const [delayDays, setDelayDays] = useState(0)
  const [isPending, startTransition] = useTransition()
  
  const [simulatedRisk, setSimulatedRisk] = useState<RiskAnalysis | null>(null)
  const [simulatedOutcomes, setSimulatedOutcomes] = useState<FutureOutcome[]>([])

  useEffect(() => {
    startTransition(() => {
      simulateWhatIfAction(deadline.toISOString(), importance, currentProgress, delayDays)
        .then(({ risk, outcomes }) => {
          setSimulatedRisk(risk)
          setSimulatedOutcomes(outcomes)
        })
    })
  }, [delayDays, deadline, importance, currentProgress])

  const getRiskColor = (band?: string) => {
    if (band === 'Critical') return 'var(--color-risk-critical)'
    if (band === 'High Risk') return 'var(--color-risk-high)'
    if (band === 'Monitor') return 'var(--color-risk-medium)'
    if (band === 'On Track') return 'var(--color-risk-low)'
    return 'var(--color-text-primary)'
  }

  const riskColor = getRiskColor(simulatedRisk?.band)

  return (
    <div className="intel-card overflow-hidden border border-[var(--color-border)]">
      <div className="p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-base)] flex justify-between items-center">
        <p className="text-[10px] font-bold text-[var(--color-accent-primary)] uppercase tracking-widest flex items-center gap-2">
          <Activity size={12} /> What-If Simulator
        </p>
        <div className="flex items-center gap-1.5">
          <Clock size={12} className="text-[var(--color-text-muted)]" />
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Time Delay</span>
        </div>
      </div>
      
      <div className="p-5 bg-[var(--color-bg-elevated)] space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <label htmlFor="delay-slider" className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Delay Work By
            </label>
            <span className="text-xl font-bold font-orbitron text-[var(--color-accent-primary)]">
              {delayDays} {delayDays === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <input
            id="delay-slider"
            type="range"
            min="0"
            max="7"
            step="1"
            value={delayDays}
            onChange={(e) => setDelayDays(parseInt(e.target.value))}
            className="w-full accent-[var(--color-accent-primary)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--color-text-muted)] mt-1 uppercase font-semibold">
            <span>0 Days</span>
            <span>7 Days</span>
          </div>
        </div>

        {/* Results Box */}
        <div className={`p-4 rounded-sm border border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] transition-opacity duration-300 ${isPending ? 'opacity-50' : 'opacity-100'}`}>
          {simulatedRisk ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Projected Risk</p>
                  <p className="text-xs font-bold uppercase tracking-widest px-2 py-1 inline-block border" style={{ color: riskColor, borderColor: riskColor, backgroundColor: `${riskColor}15` }}>
                    {simulatedRisk.band}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">Score</p>
                  <p className="text-3xl font-bold font-orbitron leading-none" style={{ color: riskColor }}>
                    {simulatedRisk.score}
                  </p>
                </div>
              </div>
              
              <div className="h-px w-full bg-[var(--color-border-subtle)]" />
              
              <div>
                <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-1">AI Reasoning</p>
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                  {simulatedRisk.reasoning}
                </p>
              </div>

              {simulatedOutcomes.length > 0 && (
                <>
                  <div className="h-px w-full bg-[var(--color-border-subtle)]" />
                  <div>
                     <p className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Projected Current Path</p>
                     {simulatedOutcomes.filter(o => o.type === 'Current').map((outcome, i) => (
                       <div key={i} className="flex items-center justify-between">
                         <span className="text-xs text-[var(--color-text-secondary)]">{outcome.summary}</span>
                         <span className="text-sm font-bold font-orbitron text-[var(--color-accent-primary)]">{outcome.successProbability}%</span>
                       </div>
                     ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-[var(--color-border)] rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-[var(--color-border)] rounded"></div>
                  <div className="h-4 bg-[var(--color-border)] rounded w-5/6"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
