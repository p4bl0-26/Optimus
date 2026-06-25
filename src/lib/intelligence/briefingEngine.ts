import { Briefing, Decision } from '@/types'

export function generateBriefing(decisions: Decision[]): Briefing {
  const totalCount = decisions.length
  
  // Sort by risk score descending
  const sortedDecisions = [...decisions].sort((a, b) => b.risk.score - a.risk.score)
  
  const criticalDecisions = sortedDecisions.filter(d => d.risk.band === 'Critical' || d.risk.band === 'High Risk')
  const criticalCount = criticalDecisions.length

  const highestRiskDecision = sortedDecisions[0]

  let summary = ''
  let executiveMessage = ''

  if (totalCount === 0) {
    summary = 'No active obligations tracked.'
    executiveMessage = 'System is idle. Awaiting data ingestion.'
  } else {
    summary = `I analyzed ${totalCount} active obligations. ${criticalCount > 0 ? `${criticalCount} require intervention.` : 'All systems nominal.'}`
    
    if (highestRiskDecision) {
      if (highestRiskDecision.risk.band === 'Critical' || highestRiskDecision.risk.band === 'High Risk') {
        executiveMessage = `Failure probability for ${highestRiskDecision.obligation.title} is increasing due to approaching deadline. Immediate intervention required.`
      } else {
        executiveMessage = 'Execution velocity is stable across the network. Continue current trajectory.'
      }
    }
  }

  const recommendedFocus = highestRiskDecision 
    ? highestRiskDecision.risk.recommendedFocus 
    : 'No focus required.'

  return {
    summary,
    highestRiskObligation: highestRiskDecision ? highestRiskDecision.obligation : null,
    criticalCount,
    totalCount,
    recommendedFocus,
    executiveMessage
  }
}
