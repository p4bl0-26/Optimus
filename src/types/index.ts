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

export interface ScheduledBlock {
  id: string;
  obligationId: string;
  title: string;
  source: string;
  riskBand: string;
  startTime: string;
  endTime: string;
  confidence: number;
  reason: string;
}

export interface WeeklySchedule {
  generatedAt: string;
  confidence: number;
  overloadedDays: string[];
  criticalWarnings: string[];
  blocks: ScheduledBlock[];
}

// ============================================================
// Phase 10.8: Work Accelerator & Form Assistant Types
// ============================================================

export interface WorkAccelerationPackage {
  executiveSummary: string;
  blueprint: string[];
  researchTopics: string[];
  referencesNeeded: string[];
  firstDraft?: string;
  estimatedDuration: number;   // in minutes
  successProbability: number;  // 0–100
  generatedAt: string;
}

export interface FormDraft {
  id: string;
  formType: string;
  title: string;
  completedFields: number;
  totalFields: number;
  confidence: number;           // 0–100
  missingFields: string[];
  fields: Record<string, string>;
  recommendations: string[];
  status: 'READY' | 'MISSING_INFORMATION' | 'REQUIRES_APPROVAL';
}

// ─── Future-Ready Architecture (DO NOT EXECUTE) ───────────────
// Prepared for future browser automation capability.
// Human approval remains mandatory — OPTIMUS MUST NEVER execute these.
export interface BrowserAction {
  action: 'fill';
  selector: string;
  value: string;
}


// ============================================================
// Phase 10.9: Adaptive Executive Summarizer Types
// ============================================================

export type ExecutiveSummaryRiskLevel = 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type ExecutionState = 'INFORM' | 'PLAN' | 'EXECUTE' | 'CRISIS';

export interface ExecutiveSummaryPackage {
  riskLevel: ExecutiveSummaryRiskLevel;
  executionState: ExecutionState;
  executiveSummary: string;
  enabledCapabilities: string[];  // what was generated at this level
  chiefDirective?: string;        // populated at HIGH / CRITICAL
  confidence: number;             // 0–100
}

