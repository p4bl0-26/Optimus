/**
 * OPTIMUS — Adaptive Executive Summarizer
 * Phase 10.9 (Final Spec)
 *
 * The amount of assistance scales with operational risk.
 *
 * INFORM  (NORMAL   risk < 40):   Summary + start time + duration
 * PLAN    (MODERATE 40–69):       + Blueprint + research + timeline + what-if
 * EXECUTE (HIGH     70–84):       + First draft + references + rescue plan + form button
 * CRISIS  (CRITICAL 85+):         + Everything + crisis mode + form draft + escalation commands
 *
 * All decision-making is deterministic.
 * Gemini 2.5 Flash used ONLY for executive summaries and first drafts.
 * No new databases, agents, or external services.
 */

import {
  ExecutiveSummaryPackage,
  ExecutiveSummaryRiskLevel,
  ExecutionState,
  WorkAccelerationPackage,
  FormDraft,
} from '@/types';
import { Obligation, RiskProfile } from '@/types/database';
import { StrategicRecommendation, RescuePlan, FutureOutcome } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Risk Classification ──────────────────────────────────────
function classifyRisk(score: number): { level: ExecutiveSummaryRiskLevel; state: ExecutionState } {
  if (score >= 85) return { level: 'CRITICAL', state: 'CRISIS' };
  if (score >= 70) return { level: 'HIGH',     state: 'EXECUTE' };
  if (score >= 40) return { level: 'MODERATE', state: 'PLAN' };
  return               { level: 'NORMAL',   state: 'INFORM' };
}

// ─── Confidence ───────────────────────────────────────────────
function deriveConfidence(score: number, chiefCount: number): number {
  return Math.min(99, Math.round(Math.max(60, 100 - score * 0.3) + Math.min(10, chiefCount * 3)));
}

// ─── Duration Label ───────────────────────────────────────────
function durationLabel(score: number, type: string): string {
  const base: Record<string, number> = {
    assignment: 240, classroom: 180, hackathon: 300,
    email: 30, meeting: 60, interview: 120, calendar: 60,
  };
  const mins = (base[type] ?? 120) * (1 + score / 100 * 0.5);
  const hrs = Math.round(mins / 60 * 10) / 10;
  return hrs >= 1 ? `${hrs} hours` : `${Math.round(mins)} minutes`;
}

// ─── Suggested Start Time ─────────────────────────────────────
function suggestStart(level: ExecutiveSummaryRiskLevel): string {
  const h = new Date().getHours();
  if (level === 'CRITICAL') return 'Immediately — do not delay.';
  if (level === 'HIGH')     return h < 14 ? 'Today at 2:00 PM' : 'Tomorrow at 9:00 AM';
  if (level === 'MODERATE') return h < 16 ? 'Tomorrow at 10:00 AM' : 'Day after tomorrow at 9:30 AM';
  return 'Tomorrow at 10:00 AM';
}

// ─── Chief Directive ──────────────────────────────────────────
function buildDirective(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefs: StrategicRecommendation[]
): string {
  const top = [...chiefs].sort((a, b) => a.priority - b.priority)[0];
  if (top) return `${top.recommendation} (Confidence: ${Math.round((top.confidence ?? 0.85) * 100)}%)`;
  return riskProfile?.reasoning?.slice(0, 200)
    ?? `Prioritize ${obligation.title} above all other active obligations.`;
}

// ─── Blueprint Builder ────────────────────────────────────────
function buildBlueprint(obligation: Obligation): string[] {
  const t = obligation.title.toLowerCase();
  if (t.includes('database') || t.includes('dbms') || t.includes('sql'))
    return ['1. Introduction', '2. ER Diagram', '3. Normalization (1NF–BCNF)', '4. Indexing & Optimization', '5. Transaction Management', '6. Conclusion'];
  if (t.includes('machine learning') || t.includes('ml'))
    return ['1. Problem Definition', '2. EDA & Feature Engineering', '3. Model Selection', '4. Training & Evaluation', '5. Results & Metrics', '6. Conclusion'];
  if (t.includes('hackathon') || t.includes('project'))
    return ['1. Problem Statement', '2. Architecture Design', '3. Core Implementation', '4. Testing & QA', '5. Demo Preparation', '6. Submission'];
  if (t.includes('network') || t.includes('protocol'))
    return ['1. Network Overview', '2. Protocol Analysis', '3. Routing & Switching', '4. Security', '5. Implementation', '6. Conclusion'];
  return ['1. Abstract & Introduction', '2. Literature Review', '3. Methodology', '4. Implementation', '5. Results & Analysis', '6. Conclusion'];
}

// ─── Research Topics ──────────────────────────────────────────
function buildResearch(obligation: Obligation, riskProfile: RiskProfile | null): string[] {
  const t = obligation.title.toLowerCase();
  const urgent = riskProfile && riskProfile.risk_score >= 70
    ? ['⚡ URGENT: Identify minimum viable scope to meet deadline'] : [];
  if (t.includes('database') || t.includes('dbms'))
    return [...urgent, 'PostgreSQL normalization best practices', 'ACID transaction properties', 'B-Tree vs Hash indexing', 'SQL query optimization'];
  if (t.includes('machine learning') || t.includes('ml'))
    return [...urgent, 'Cross-validation strategies', 'Gradient boosting vs Random Forest', 'Model evaluation metrics (F1, AUC-ROC)'];
  if (t.includes('hackathon'))
    return [...urgent, 'REST API design patterns', 'Authentication strategies', 'Deployment on Vercel / Railway'];
  return [...urgent, `Recent academic papers on ${obligation.title}`, 'Industry standards', 'Case studies and real-world examples'];
}

// ─── References Needed ────────────────────────────────────────
function buildRefs(obligation: Obligation): string[] {
  const t = obligation.title.toLowerCase();
  if (t.includes('database') || t.includes('dbms'))
    return ['Ramakrishnan & Gehrke — Database Management Systems (3rd ed.)', 'PostgreSQL Official Docs', '1 recent ACM paper (2020+)', 'IEEE paper on indexing'];
  if (t.includes('machine learning') || t.includes('ml'))
    return ['Géron — Hands-On ML (3rd ed.)', 'Scikit-learn Documentation', '2 peer-reviewed papers on your algorithm'];
  return ['2+ peer-reviewed papers (Google Scholar)', '1 official documentation source', '1 industry report'];
}

// ─── Gemini Prose Generator ───────────────────────────────────
async function geminiSummary(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  level: ExecutiveSummaryRiskLevel
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `${obligation.title}: ${riskProfile?.reasoning ?? 'Analysis pending — add GEMINI_API_KEY to .env.local.'}`;
  }

  const toneMap = {
    NORMAL: 'concise and calm',
    MODERATE: 'structured and professional',
    HIGH: 'urgent and focused',
    CRITICAL: 'directive and commanding — start with IMMEDIATE ACTION REQUIRED',
  };

  const prompt = `You are OPTIMUS AI Chief of Staff. Write a ${toneMap[level]} executive summary.

Obligation: ${obligation.title}
Type: ${obligation.type ?? 'general'}
Risk Level: ${level}
Risk Score: ${riskProfile?.risk_score ?? 'Unknown'}
Risk Band: ${riskProfile?.risk_band ?? 'Unknown'}
Analysis: ${riskProfile?.reasoning ?? 'No analysis available.'}
Description: ${obligation.description ?? 'No description.'}

Write 2–4 sentences. Be specific. Reference the obligation by name.
No markdown headers. No bullet points. Plain prose only.
End with confidence in parentheses e.g. (Confidence: 91%)`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch {
    return `${obligation.title} requires ${level.toLowerCase()} level attention. ${riskProfile?.reasoning ?? ''}`;
  }
}

// ─── LEVEL 1: INFORM (NORMAL) ─────────────────────────────────
async function buildInform(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefs: StrategicRecommendation[]
): Promise<ExecutiveSummaryPackage> {
  const { level, state } = classifyRisk(riskProfile?.risk_score ?? 10);
  const confidence = deriveConfidence(riskProfile?.risk_score ?? 10, chiefs.length);
  const duration = durationLabel(riskProfile?.risk_score ?? 10, obligation.type ?? '');
  const startTime = suggestStart(level);
  const summary = await geminiSummary(obligation, riskProfile, level);

  return {
    riskLevel: level,
    executionState: state,
    executiveSummary: summary,
    enabledCapabilities: [
      `Estimated Duration: ${duration}`,
      `Suggested Start: ${startTime}`,
      `Priority: ${obligation.priority ?? 'medium'}`,
      `Due Date Reminder: ${obligation.due_date ? new Date(obligation.due_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'No deadline set'}`,
    ],
    confidence,
  };
}

// ─── LEVEL 2: PLAN (MODERATE) ────────────────────────────────
async function buildPlan(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefs: StrategicRecommendation[],
  futureOutcomes: FutureOutcome[]
): Promise<ExecutiveSummaryPackage> {
  const { level, state } = classifyRisk(riskProfile?.risk_score ?? 55);
  const confidence = deriveConfidence(riskProfile?.risk_score ?? 55, chiefs.length);
  const duration = durationLabel(riskProfile?.risk_score ?? 55, obligation.type ?? '');
  const startTime = suggestStart(level);
  const blueprint = buildBlueprint(obligation);
  const research = buildResearch(obligation, riskProfile);
  const summary = await geminiSummary(obligation, riskProfile, level);

  const recommended = futureOutcomes.find(o => o.type === 'Recommended');
  const successPct = recommended?.successProbability ?? Math.round(100 - (riskProfile?.risk_score ?? 55));

  const topRec = chiefs[0];

  return {
    riskLevel: level,
    executionState: state,
    executiveSummary: summary,
    enabledCapabilities: [
      `Estimated Duration: ${duration}`,
      `Suggested Start: ${startTime}`,
      `Blueprint: ${blueprint.slice(0, 3).join(' → ')} ...`,
      `Full Blueprint: ${blueprint.join(' | ')}`,
      `Research Focus: ${research.slice(0, 2).join('; ')}`,
      ...(topRec ? [`Chief Recommendation: ${topRec.recommendation}`] : []),
      `Success Probability: ${successPct}%`,
    ],
    confidence,
  };
}

// ─── LEVEL 3: EXECUTE (HIGH) ──────────────────────────────────
async function buildExecute(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefs: StrategicRecommendation[],
  futureOutcomes: FutureOutcome[],
  rescuePlan: RescuePlan | null,
  workPackage: WorkAccelerationPackage | null
): Promise<ExecutiveSummaryPackage> {
  const { level, state } = classifyRisk(riskProfile?.risk_score ?? 77);
  const confidence = deriveConfidence(riskProfile?.risk_score ?? 77, chiefs.length);
  const duration = durationLabel(riskProfile?.risk_score ?? 77, obligation.type ?? '');
  const startTime = suggestStart(level);
  const blueprint = buildBlueprint(obligation);
  const research = buildResearch(obligation, riskProfile);
  const refs = buildRefs(obligation);
  const chiefDirective = buildDirective(obligation, riskProfile, chiefs);
  const summary = await geminiSummary(obligation, riskProfile, level);

  const recommended = futureOutcomes.find(o => o.type === 'Recommended');
  const successPct = recommended?.successProbability ?? Math.round(100 - (riskProfile?.risk_score ?? 77));

  const draftStatus = workPackage?.firstDraft
    ? `First Draft: GENERATED (${workPackage.firstDraft.split(' ').length} words) — copy from Work Accelerator`
    : 'First Draft: PENDING — click Work Accelerator → GENERATE FIRST DRAFT';

  return {
    riskLevel: level,
    executionState: state,
    executiveSummary: summary,
    enabledCapabilities: [
      `Estimated Duration: ${duration}`,
      `Suggested Start: ${startTime}`,
      `Blueprint: ${blueprint.join(' | ')}`,
      `Research: ${research.join('; ')}`,
      `References Needed: ${refs.join('; ')}`,
      draftStatus,
      ...(rescuePlan ? [
        `Rescue Plan — Today: ${rescuePlan.actions.today.slice(0, 1).join(', ')}`,
        `Rescue Plan — Tomorrow: ${rescuePlan.actions.tomorrow.slice(0, 1).join(', ')}`,
      ] : []),
      `Focus Mode: Strongly recommended for this obligation`,
      `Deep Work: Schedule 90-min block starting ${startTime}`,
      `Success Probability: ${successPct}%`,
      'FORM_BUTTON: PREPARE_FORM',  // sentinel — UI will render the button when this appears
    ],
    chiefDirective,
    confidence,
  };
}

// ─── LEVEL 4: CRISIS (CRITICAL) ───────────────────────────────
async function buildCrisis(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefs: StrategicRecommendation[],
  futureOutcomes: FutureOutcome[],
  rescuePlan: RescuePlan | null,
  workPackage: WorkAccelerationPackage | null,
  formDraft: FormDraft | null
): Promise<ExecutiveSummaryPackage> {
  const { level, state } = classifyRisk(riskProfile?.risk_score ?? 90);
  const confidence = deriveConfidence(riskProfile?.risk_score ?? 90, chiefs.length);
  const chiefDirective = buildDirective(obligation, riskProfile, chiefs);
  const summary = await geminiSummary(obligation, riskProfile, level);

  const primaryObjectives = chiefs.slice(0, 3).map((r, i) => `OBJ_${i + 1}: ${r.recommendation}`);

  const formStatus = formDraft
    ? `FORM: ${formDraft.completedFields}/${formDraft.totalFields} fields · Confidence ${formDraft.confidence}% · Missing: ${formDraft.missingFields.join(', ') || 'None'}`
    : 'FORM: PENDING — use Work Accelerator → PREPARE FORM';

  const draftStatus = workPackage?.firstDraft
    ? `DRAFT: GENERATED — review and approve before submission`
    : 'DRAFT: PENDING — Work Accelerator → GENERATE FIRST DRAFT';

  const crisisCommands = [
    `CMD: ENTER FOCUS MODE for ${obligation.title}`,
    'CMD: SUSPEND all low-priority obligations immediately',
    'CMD: ACTIVATE 90-min deep work blocks — no interruptions',
    'CMD: ESCALATE to accountability partner if deadline slips further',
    `CMD: ${workPackage?.firstDraft ? 'REVIEW AND APPROVE first draft' : 'GENERATE first draft NOW'}`,
    'CMD: CANCEL or reschedule low-value calendar events this week',
  ];

  const rescueCapabilities = rescuePlan ? [
    `RESCUE — Today: ${rescuePlan.actions.today.slice(0, 2).join(' | ')}`,
    `RESCUE — Tomorrow: ${rescuePlan.actions.tomorrow.slice(0, 1).join(' | ')}`,
    `RESCUE — Before Deadline: ${rescuePlan.actions.beforeDeadline.slice(0, 1).join(' | ')}`,
  ] : [];

  return {
    riskLevel: level,
    executionState: state,
    executiveSummary: summary,
    enabledCapabilities: [
      'CRISIS_BANNER',  // sentinel for UI
      ...primaryObjectives,
      ...crisisCommands,
      ...rescueCapabilities,
      draftStatus,
      formStatus,
      `ACCOUNTABILITY: Escalation ready — use Accountability section below`,
      `CHIEF_CONFIDENCE: ${confidence}%`,
    ],
    chiefDirective,
    confidence,
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export async function generateAdaptiveExecutiveSummary(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefRecommendations: StrategicRecommendation[],
  futureOutcomes: FutureOutcome[] = [],
  rescuePlan: RescuePlan | null = null,
  workPackage: WorkAccelerationPackage | null = null,
  formDraft: FormDraft | null = null
): Promise<ExecutiveSummaryPackage> {
  const score = riskProfile?.risk_score ?? 0;
  const { level } = classifyRisk(score);

  switch (level) {
    case 'CRITICAL':
      return buildCrisis(obligation, riskProfile, chiefRecommendations, futureOutcomes, rescuePlan, workPackage, formDraft);
    case 'HIGH':
      return buildExecute(obligation, riskProfile, chiefRecommendations, futureOutcomes, rescuePlan, workPackage);
    case 'MODERATE':
      return buildPlan(obligation, riskProfile, chiefRecommendations, futureOutcomes);
    case 'NORMAL':
    default:
      return buildInform(obligation, riskProfile, chiefRecommendations);
  }
}
