import { ImportanceLevel, RiskBand } from '@/types'

export interface RiskResult {
  score: number
  band: RiskBand
  reasoning: string
}

export function calculateRisk(
  deadline: Date,
  importance: ImportanceLevel,
  progress: number
): RiskResult {
  const now = new Date()
  const hoursRemaining = Math.max(0, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60))

  // Base progress gap (0-100)
  const progressGap = 100 - progress

  // Importance multiplier
  const importanceMultiplier = {
    Low: 0.8,
    Medium: 1.0,
    High: 1.3,
    Critical: 1.6,
  }[importance]

  // Urgency multiplier
  let urgencyMultiplier = 1.0
  if (hoursRemaining <= 24) urgencyMultiplier = 2.0
  else if (hoursRemaining <= 72) urgencyMultiplier = 1.5
  else if (hoursRemaining <= 168) urgencyMultiplier = 1.2
  else urgencyMultiplier = 0.8

  // Calculate raw score
  let score = Math.round(progressGap * importanceMultiplier * urgencyMultiplier)

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score))

  // Determine Band (Locked Thresholds)
  let band: RiskBand = 'Safe'
  if (score >= 86) band = 'Critical'
  else if (score >= 71) band = 'High Risk'
  else if (score >= 41) band = 'Monitor'

  // Generate Reasoning
  let reasoning = ''
  if (score >= 86) {
    reasoning = `Critical failure risk. Progress is at ${progress}%, well below safe thresholds for a deadline in ${Math.ceil(hoursRemaining)} hours.`
  } else if (score >= 71) {
    reasoning = `Elevated risk detected. Urgent action required to complete remaining ${progressGap}% before deadline.`
  } else if (score >= 41) {
    reasoning = `Velocity is marginal. Monitoring required to prevent slippage.`
  } else {
    reasoning = `On track. Progress aligns with expected completion trajectory.`
  }

  return { score, band, reasoning }
}
