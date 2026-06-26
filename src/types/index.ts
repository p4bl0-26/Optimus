// ============================================================
// OPTIMUS Core Types
// ============================================================

export type RiskBand = 'Safe' | 'Monitor' | 'High Risk' | 'Critical'
export type ImportanceLevel = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Obligation {
  id: string
  title: string
  description: string
  deadline: Date
  importance: ImportanceLevel
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
}

export interface RiskAnalysis {
  score: number // 0-100
  band: RiskBand
  reasoning: string
  factors: string[]
  missingWork: string[]
  recommendedFocus: string
  timePressureAnalysis: string
  completionHealth: string
}

export interface FutureOutcome {
  type: 'Recommended' | 'Current' | 'Danger'
  successProbability: number // 0-100
  summary: string
  projectedResult: string
}

export interface RescuePlan {
  immediatePriorities: string[]
  executionSequence: string[]
  recoveryStrategy: string
  actions: {
    today: string[]
    tomorrow: string[]
    beforeDeadline: string[]
  }
}

export interface Decision {
  id: string // typically matches obligation id
  obligation: Obligation
  risk: RiskAnalysis
  outcomes: FutureOutcome[]
  rescuePlan: RescuePlan
  recommendedAction: string
}

export interface Briefing {
  summary: string
  highestRiskObligation: Obligation | null
  criticalCount: number
  totalCount: number
  recommendedFocus: string
  executiveMessage: string
}

export interface NavItem {
  id: string
  label: string
  href: string
  icon: string
  badge?: number | string
}

// ============================================================
// Phase 7: Chief of Staff Types
// ============================================================

export type AccountabilityPartner = {
  name: string
  relationship: "friend" | "mentor" | "parent" | "teammate"
}

export interface StrategicRecommendation {
  priority: number
  recommendation: string
  reason: string
  confidence: number
}

export interface RecommendedFocus {
  title: string
  reason: string
  confidence: number
}

export interface ExecutiveBriefing {
  executiveSummary: string
  morningBriefing: string
  eveningBriefing: string
  highestRiskTarget: string
  recommendedFocus: RecommendedFocus | null
  strategicRecommendations: StrategicRecommendation[]
  overloadedDays: string[]
}

export interface WeeklyExecutiveReport {
  weekLabel: string
  executiveSummary: string
  completedCount: number
  missedCount: number
  activeCount: number
  productivityScore: number
  riskReduction: number
  highestRiskCategory: string
  strategicRecommendations: StrategicRecommendation[]
  memoryInsights: string[]
  chiefAssessment: {
    summary: string
    recommendation: string
    grade: string
    confidence: number
  }
  trendData: {
    day: string
    risk: number
  }[]
}
