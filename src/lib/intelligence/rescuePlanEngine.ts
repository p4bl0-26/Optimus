import { Obligation, RescuePlan, RiskAnalysis } from '@/types'

export function generateRescuePlan(obligation: Obligation, risk: RiskAnalysis): RescuePlan {
  const isUrgent = risk.band === 'Critical' || risk.band === 'High Risk'
  
  const actionsToday: string[] = []
  const actionsTomorrow: string[] = []
  const actionsBeforeDeadline: string[] = []

  if (isUrgent) {
    actionsToday.push(`Immediate intervention required on ${obligation.title}.`)
    actionsToday.push(`Complete core framework and unblock dependencies.`)
    actionsTomorrow.push(`Dedicate minimum 2 hours focused work to clear deficit.`)
    actionsBeforeDeadline.push(`Final QA and submission process.`)
  } else {
    actionsToday.push(`Review requirements and scope work for ${obligation.title}.`)
    actionsTomorrow.push(`Begin incremental progress.`)
    actionsBeforeDeadline.push(`Complete standard review cycle.`)
  }

  // Inject specific actions based on mock obligation title for realism
  if (obligation.title.toLowerCase().includes('hackathon')) {
    actionsToday.unshift('Finalize demo video recording.')
    actionsTomorrow.unshift('Push final code to repository and deploy.')
  } else if (obligation.title.toLowerCase().includes('dbms')) {
    actionsToday.unshift('Draft database schema diagram.')
    actionsTomorrow.unshift('Write remaining SQL queries.')
  }

  const recoveryStrategy = isUrgent 
    ? 'Aggressive deficit reduction. Drop non-essential tasks.'
    : 'Maintain steady state execution.'

  return {
    immediatePriorities: [actionsToday[0] || 'Awaiting task breakdown'],
    executionSequence: ['Scope', 'Draft', 'Review', 'Submit'],
    recoveryStrategy,
    actions: {
      today: actionsToday,
      tomorrow: actionsTomorrow,
      beforeDeadline: actionsBeforeDeadline
    }
  }
}
