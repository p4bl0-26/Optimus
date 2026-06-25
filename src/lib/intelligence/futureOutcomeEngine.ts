import { FutureOutcome, RiskAnalysis } from '@/types'

export function generateOutcomes(risk: RiskAnalysis): FutureOutcome[] {
  // Base success probability is inversely proportional to risk score
  const baseProbability = 100 - risk.score

  // Recommended Path: Assuming optimal intervention
  const recommendedProb = Math.min(99, Math.round(baseProbability + (risk.score * 0.8)))
  const recommendedOutcome: FutureOutcome = {
    type: 'Recommended',
    successProbability: recommendedProb,
    summary: 'High probability of success if recommended actions are executed immediately.',
    projectedResult: 'On-time completion with high quality.'
  }

  // Current Path: Assuming no change in velocity
  const currentProb = Math.max(0, Math.round(baseProbability))
  const currentOutcome: FutureOutcome = {
    type: 'Current',
    successProbability: currentProb,
    summary: risk.band === 'Safe' 
      ? 'Current velocity is sufficient for success.' 
      : 'Current velocity will likely result in failure or severe compromise.',
    projectedResult: risk.band === 'Safe' ? 'Expected completion.' : 'High risk of deadline miss.'
  }

  // Danger Path: Assuming delay
  const dangerProb = Math.max(0, Math.round(baseProbability * 0.3))
  const dangerOutcome: FutureOutcome = {
    type: 'Danger',
    successProbability: dangerProb,
    summary: 'Simulation of ignoring current high-risk alerts or delaying work further.',
    projectedResult: 'Failure state.'
  }

  return [recommendedOutcome, currentOutcome, dangerOutcome]
}
