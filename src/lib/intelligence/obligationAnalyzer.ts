import { Obligation, RiskAnalysis } from '@/types'
import { calculateRisk } from './riskEngine'

export function analyzeObligation(obligation: Obligation): RiskAnalysis {
  const { score, band, reasoning } = calculateRisk(
    obligation.deadline,
    obligation.importance,
    obligation.progress
  )

  const hoursRemaining = Math.max(0, (obligation.deadline.getTime() - Date.now()) / (1000 * 60 * 60))
  
  // Deterministic Analysis Generation based on attributes
  const factors: string[] = []
  if (hoursRemaining < 48) factors.push('Extreme time pressure')
  if (obligation.importance === 'Critical' || obligation.importance === 'High') factors.push('High strategic impact')
  if (obligation.progress < 50) factors.push('Significant progress deficit')
  if (factors.length === 0) factors.push('Standard execution trajectory')

  const missingWork: string[] = []
  if (obligation.progress < 100) {
    if (obligation.progress < 25) missingWork.push('Initial framing and architecture')
    if (obligation.progress < 75) missingWork.push('Core implementation and drafting')
    missingWork.push('Final review and submission')
  }

  let recommendedFocus = 'Maintain current velocity'
  if (band === 'Critical') recommendedFocus = 'Drop all other non-critical tasks. Focus entirely on execution.'
  else if (band === 'High Risk') recommendedFocus = 'Dedicate next available work session to clear deficit.'
  else if (band === 'Monitor') recommendedFocus = 'Ensure steady progress today to prevent risk escalation.'

  let timePressureAnalysis = 'Comfortable buffer'
  if (hoursRemaining < 24) timePressureAnalysis = 'Immediate deadline proximity'
  else if (hoursRemaining < 72) timePressureAnalysis = 'Approaching critical window'

  let completionHealth = 'Healthy'
  if (score >= 71) completionHealth = 'Deteriorating'
  if (score >= 86) completionHealth = 'At Risk of Failure'

  return {
    score,
    band,
    reasoning,
    factors,
    missingWork,
    recommendedFocus,
    timePressureAnalysis,
    completionHealth
  }
}
