'use server'

import { ImportanceLevel, RiskAnalysis } from '@/types'
import { calculateRisk } from '@/lib/intelligence/riskEngine'
import { generateOutcomes } from '@/lib/intelligence/futureOutcomeEngine'

export async function simulateWhatIfAction(
  deadlineStr: string,
  importance: ImportanceLevel,
  currentProgress: number,
  hypotheticalDelayDays: number
) {
  const originalDeadline = new Date(deadlineStr)
  
  // To simulate a delay in starting work, we subtract days from the deadline,
  // bringing it closer to now.
  const simulatedDeadline = new Date(originalDeadline.getTime() - (hypotheticalDelayDays * 24 * 60 * 60 * 1000))
  
  const { score, band, reasoning } = calculateRisk(
    simulatedDeadline,
    importance,
    currentProgress
  )

  const hoursRemaining = Math.max(0, (simulatedDeadline.getTime() - Date.now()) / (1000 * 60 * 60))
  
  const factors: string[] = []
  if (hoursRemaining < 48) factors.push('Extreme time pressure')
  if (importance === 'Critical' || importance === 'High') factors.push('High strategic impact')
  if (currentProgress < 50) factors.push('Significant progress deficit')
  if (factors.length === 0) factors.push('Standard execution trajectory')

  const missingWork: string[] = []
  if (currentProgress < 100) {
    if (currentProgress < 25) missingWork.push('Initial framing and architecture')
    if (currentProgress < 75) missingWork.push('Core implementation and drafting')
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

  const riskAnalysis: RiskAnalysis = {
    score,
    band,
    reasoning,
    factors,
    missingWork,
    recommendedFocus,
    timePressureAnalysis,
    completionHealth
  }

  const outcomes = generateOutcomes(riskAnalysis)

  return {
    risk: riskAnalysis,
    outcomes
  }
}
