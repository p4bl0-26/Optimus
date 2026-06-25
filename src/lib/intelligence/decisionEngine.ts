import { Decision, Obligation } from '@/types'
import { analyzeObligation } from './obligationAnalyzer'
import { generateOutcomes } from './futureOutcomeEngine'
import { generateRescuePlan } from './rescuePlanEngine'

export function processObligation(obligation: Obligation): Decision {
  // 1. Analyze risk and current state
  const riskAnalysis = analyzeObligation(obligation)

  // 2. Generate future outcome paths based on risk
  const outcomes = generateOutcomes(riskAnalysis)

  // 3. Generate actionable rescue plan
  const rescuePlan = generateRescuePlan(obligation, riskAnalysis)

  // 4. Determine single recommended immediate action
  const recommendedAction = rescuePlan.actions.today[0] || 'Awaiting task breakdown'

  // Assemble the complete Decision intelligence object
  return {
    id: obligation.id,
    obligation,
    risk: riskAnalysis,
    outcomes,
    rescuePlan,
    recommendedAction
  }
}
