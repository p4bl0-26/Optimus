/**
 * OPTIMUS — Work Acceleration Engine
 * Phase 10.8: AI Work Accelerator
 *
 * Pure orchestration layer. Deterministic branching by obligation.type.
 * Gemini 2.5 Flash is invoked ONLY for prose generation (first drafts,
 * email replies, interview questions, research summaries).
 * All orchestration decisions remain deterministic.
 *
 * HUMAN APPROVAL IS MANDATORY for all outputs.
 * OPTIMUS MUST NEVER submit, send, or click on the user's behalf.
 */

import { WorkAccelerationPackage } from '@/types';
import { Obligation, RiskProfile } from '@/types/database';
import { StrategicRecommendation } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = 'gemini-2.5-flash';

// ─── Duration Estimator ──────────────────────────────────────
function estimateDuration(riskScore: number, type: string): number {
  const base: Record<string, number> = {
    assignment: 240,
    email: 30,
    meeting: 60,
    interview: 120,
    calendar: 60,
    classroom: 180,
  };
  const baseMins = base[type] ?? 120;
  // High risk obligations need more time — scale up linearly
  const multiplier = 1 + (riskScore / 100) * 0.5;
  return Math.round(baseMins * multiplier);
}

// ─── Success Probability ─────────────────────────────────────
function computeSuccessProbability(riskScore: number, chiefRecommendations: StrategicRecommendation[]): number {
  // Base: inverse of risk
  const base = Math.max(20, 100 - riskScore);
  // Boost if there are active strategic recommendations covering this work
  const boost = Math.min(15, chiefRecommendations.length * 4);
  return Math.min(98, Math.round(base + boost));
}

// ─── Deterministic Blueprint ─────────────────────────────────
function buildBlueprint(obligation: Obligation): string[] {
  const title = obligation.title.toLowerCase();

  // Database/SQL/DBMS patterns
  if (title.includes('database') || title.includes('dbms') || title.includes('sql')) {
    return [
      '1. Introduction & Problem Statement',
      '2. Entity-Relationship (ER) Diagram',
      '3. Normalization — 1NF, 2NF, 3NF, BCNF',
      '4. Indexing Strategies & Query Optimization',
      '5. Transaction Management (ACID Properties)',
      '6. Implementation Examples (PostgreSQL / MySQL)',
      '7. Conclusion & Reflections',
    ];
  }
  // ML / AI / Data Science
  if (title.includes('machine learning') || title.includes('ml') || title.includes('ai') || title.includes('data science')) {
    return [
      '1. Problem Definition & Dataset Description',
      '2. Exploratory Data Analysis (EDA)',
      '3. Feature Engineering & Preprocessing',
      '4. Model Selection & Justification',
      '5. Training, Validation & Hyperparameter Tuning',
      '6. Results & Performance Metrics',
      '7. Conclusion & Future Work',
    ];
  }
  // Networking
  if (title.includes('network') || title.includes('tcp') || title.includes('udp') || title.includes('protocol')) {
    return [
      '1. Network Architecture Overview',
      '2. OSI / TCP-IP Model Layers',
      '3. Protocol Analysis',
      '4. Routing & Switching Concepts',
      '5. Security Considerations',
      '6. Practical Implementation / Wireshark Analysis',
      '7. Conclusion',
    ];
  }
  // OS / Operating Systems
  if (title.includes('operating system') || title.includes('os') || title.includes('process') || title.includes('thread')) {
    return [
      '1. Introduction to Operating Systems',
      '2. Process Management & Scheduling',
      '3. Memory Management (Paging & Segmentation)',
      '4. File System Design',
      '5. Deadlock Detection & Prevention',
      '6. System Calls & Inter-Process Communication',
      '7. Conclusion',
    ];
  }
  // Hackathon / Project
  if (title.includes('hackathon') || title.includes('project') || title.includes('implementation')) {
    return [
      '1. Problem Statement & Objectives',
      '2. System Architecture & Design',
      '3. Tech Stack & Justification',
      '4. Core Features Implementation',
      '5. Testing & Quality Assurance',
      '6. Deployment & Demo Preparation',
      '7. Lessons Learned & Future Roadmap',
    ];
  }
  // Default academic / research paper
  return [
    '1. Abstract & Introduction',
    '2. Literature Review / Background',
    '3. Methodology',
    '4. Implementation / Experiments',
    '5. Results & Analysis',
    '6. Discussion',
    '7. Conclusion & References',
  ];
}

// ─── Deterministic Research Topics ───────────────────────────
function buildResearchTopics(obligation: Obligation, riskProfile: RiskProfile | null): string[] {
  const title = obligation.title.toLowerCase();
  const topics: string[] = [];

  if (title.includes('database') || title.includes('dbms')) {
    topics.push(
      'PostgreSQL normalization best practices',
      'ACID transaction properties with examples',
      'B-Tree vs Hash indexing comparison',
      'SQL query optimization techniques'
    );
  } else if (title.includes('machine learning') || title.includes('ml')) {
    topics.push(
      'Scikit-learn pipeline documentation',
      'Cross-validation strategies for small datasets',
      'Gradient boosting vs Random Forest comparison',
      'Model evaluation metrics (F1, AUC-ROC)'
    );
  } else if (title.includes('hackathon')) {
    topics.push(
      'REST API design patterns',
      'Authentication & authorization strategies',
      'Frontend performance optimization',
      'Deployment on Vercel / Railway'
    );
  } else {
    topics.push(
      `Recent academic papers on ${obligation.title}`,
      'Industry standards and best practices',
      'Case studies and real-world examples',
      'Statistical data and citations'
    );
  }

  // Add urgency-based research if high risk
  if (riskProfile && riskProfile.risk_score >= 70) {
    topics.unshift('⚡ URGENT: Identify minimum viable scope to meet deadline');
  }

  return topics;
}

// ─── References Needed ───────────────────────────────────────
function buildReferencesNeeded(obligation: Obligation): string[] {
  const title = obligation.title.toLowerCase();

  if (title.includes('database') || title.includes('dbms')) {
    return [
      'Ramakrishnan & Gehrke — Database Management Systems (3rd ed.)',
      'PostgreSQL Official Documentation — postgresql.org',
      'ACM Digital Library — relevant normalization papers',
      '1 recent academic paper (2020+) on RDBMS optimization',
    ];
  } else if (title.includes('machine learning') || title.includes('ml')) {
    return [
      'Géron — Hands-On Machine Learning (3rd ed.)',
      'Scikit-learn Documentation — scikit-learn.org',
      '2 peer-reviewed papers on your specific algorithm',
      'Kaggle competition reference (if applicable)',
    ];
  }
  return [
    '2+ peer-reviewed academic papers (Google Scholar)',
    '1 official documentation source',
    '1 industry report or case study',
  ];
}

// ─── Executive Summary (Deterministic) ───────────────────────
function buildExecutiveSummary(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  successProbability: number,
  estimatedDuration: number
): string {
  const riskContext = riskProfile
    ? `Current risk score: ${Math.round(riskProfile.risk_score)} (${riskProfile.risk_band}).`
    : 'Risk profile pending.';

  const durationHrs = Math.round(estimatedDuration / 60 * 10) / 10;

  return `${obligation.title} requires focused execution. ${riskContext} ` +
    `Estimated completion time: ${durationHrs} hours. ` +
    `Success probability under optimal conditions: ${successProbability}%. ` +
    (obligation.description ? `Context: ${obligation.description.slice(0, 200)}.` : '');
}

// ─── Gemini: First Draft / Email Reply / Interview Qs ────────
async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return '[GEMINI UNAVAILABLE] Chief intelligence offline. Please add GEMINI_API_KEY to .env.local.';
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── Assignment Package ───────────────────────────────────────
async function buildAssignmentPackage(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefRecommendations: StrategicRecommendation[],
  generateDraft: boolean
): Promise<WorkAccelerationPackage> {
  const successProbability = computeSuccessProbability(riskProfile?.risk_score ?? 50, chiefRecommendations);
  const estimatedDuration = estimateDuration(riskProfile?.risk_score ?? 50, obligation.type);
  const blueprint = buildBlueprint(obligation);
  const researchTopics = buildResearchTopics(obligation, riskProfile);
  const referencesNeeded = buildReferencesNeeded(obligation);
  const executiveSummary = buildExecutiveSummary(obligation, riskProfile, successProbability, estimatedDuration);

  let firstDraft: string | undefined;
  if (generateDraft) {
    const prompt = `You are OPTIMUS AI Chief of Staff helping a student complete an academic assignment.

Assignment: ${obligation.title}
Description: ${obligation.description || 'No additional description.'}
Deadline Context: ${riskProfile?.risk_band ?? 'Unknown'} risk.

Write a structured FIRST DRAFT for this assignment following this outline:
${blueprint.join('\n')}

Requirements:
- Use formal academic language
- Include section headers
- Keep it concise but complete (aim for 600–900 words)
- Add [PLACEHOLDER] where specific data / diagrams / code are needed
- End with a note: "Draft generated by OPTIMUS — human review required before submission."
`;
    firstDraft = await generateWithGemini(prompt);
  }

  return {
    executiveSummary,
    blueprint,
    researchTopics,
    referencesNeeded,
    firstDraft,
    estimatedDuration,
    successProbability,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Email Package ────────────────────────────────────────────
async function buildEmailPackage(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefRecommendations: StrategicRecommendation[]
): Promise<WorkAccelerationPackage> {
  const successProbability = computeSuccessProbability(riskProfile?.risk_score ?? 30, chiefRecommendations);
  const estimatedDuration = 30;

  const prompt = `You are OPTIMUS AI Chief of Staff. Generate a professional, concise email reply draft.

Email Subject / Context: ${obligation.title}
Description: ${obligation.description || 'No additional context.'}

Generate:
1. EXECUTIVE SUMMARY (2 sentences max — what this email requires)
2. ACTION ITEMS (bullet list of what the user must do)
3. DRAFT REPLY (professional email response, ready to send after user review)

End with: "Draft generated by OPTIMUS — review before sending."
`;

  const generated = await generateWithGemini(prompt);

  return {
    executiveSummary: `Email obligation: ${obligation.title}. Requires a professional reply within the defined deadline.`,
    blueprint: [
      'Review full email thread',
      'Confirm action items with sender',
      'Draft and review reply',
      'Send after approval',
    ],
    researchTopics: ['Sender background', 'Related obligations in OPTIMUS'],
    referencesNeeded: ['Original email thread', 'Any attached documents'],
    firstDraft: generated,
    estimatedDuration,
    successProbability,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Meeting Package ──────────────────────────────────────────
async function buildMeetingPackage(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefRecommendations: StrategicRecommendation[]
): Promise<WorkAccelerationPackage> {
  const successProbability = computeSuccessProbability(riskProfile?.risk_score ?? 20, chiefRecommendations);

  const prompt = `You are OPTIMUS AI Chief of Staff. Generate a structured meeting preparation brief.

Meeting: ${obligation.title}
Context: ${obligation.description || 'No additional context.'}

Generate:
1. MEETING SUMMARY (what this meeting is about in 2 sentences)
2. PRE-MEETING CHECKLIST (3-5 bullet points to prepare)
3. EXPECTED AGENDA (numbered list)
4. FOLLOW-UP TASKS (likely post-meeting deliverables)
5. KEY QUESTIONS TO ASK

End with: "Brief generated by OPTIMUS — review before attending."
`;

  const generated = await generateWithGemini(prompt);

  return {
    executiveSummary: `Meeting preparation for: ${obligation.title}. OPTIMUS has pre-generated agenda and follow-up tasks.`,
    blueprint: [
      'Review pre-meeting checklist',
      'Confirm attendees and agenda',
      'Prepare key questions',
      'Attend meeting',
      'Execute follow-up tasks',
    ],
    researchTopics: ['Attendees\' background', 'Related obligations', 'Prior meeting notes'],
    referencesNeeded: ['Meeting invite details', 'Any shared documents'],
    firstDraft: generated,
    estimatedDuration: 90,
    successProbability,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Interview Package ────────────────────────────────────────
async function buildInterviewPackage(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefRecommendations: StrategicRecommendation[]
): Promise<WorkAccelerationPackage> {
  const successProbability = computeSuccessProbability(riskProfile?.risk_score ?? 60, chiefRecommendations);
  const estimatedDuration = 120;

  const prompt = `You are OPTIMUS AI Chief of Staff preparing a candidate for a technical interview.

Interview: ${obligation.title}
Context: ${obligation.description || 'No additional context.'}

Generate a structured 2-HOUR PREPARATION PLAN:

1. STUDY TOPICS (7-10 key topics to review)
2. EXPECTED QUESTIONS (8-10 likely interview questions with brief answer frameworks)
3. 2-HOUR EXECUTION PLAN:
   - Hour 1 (00:00–60:00): Core topics to cover
   - Hour 2 (60:00–120:00): Practice questions + mock answers
4. CONFIDENCE BOOSTERS (3 mindset tips)

End with: "Preparation plan generated by OPTIMUS — practice required."
`;

  const generated = await generateWithGemini(prompt);

  return {
    executiveSummary: `Interview preparation for: ${obligation.title}. 2-hour focused study plan generated. Success probability: ${successProbability}%.`,
    blueprint: [
      '1. Review study topics (30 min)',
      '2. Practice expected questions (45 min)',
      '3. Mock interview simulation (30 min)',
      '4. Final review & confidence prep (15 min)',
    ],
    researchTopics: [
      'Company background & recent news',
      'Role-specific technical requirements',
      'Common interview patterns for this role',
    ],
    referencesNeeded: [
      'Job description (re-read carefully)',
      'Your resume / portfolio',
      'LeetCode / HackerRank (if technical)',
    ],
    firstDraft: generated,
    estimatedDuration,
    successProbability,
    generatedAt: new Date().toISOString(),
  };
}

// ─── MAIN EXPORT ─────────────────────────────────────────────
export async function generateWorkAccelerationPackage(
  obligation: Obligation,
  riskProfile: RiskProfile | null,
  chiefRecommendations: StrategicRecommendation[],
  generateDraft = true
): Promise<WorkAccelerationPackage> {
  const type = (obligation.type ?? '').toLowerCase();

  if (type === 'email') {
    return buildEmailPackage(obligation, riskProfile, chiefRecommendations);
  }
  if (type === 'meeting' || type === 'calendar') {
    return buildMeetingPackage(obligation, riskProfile, chiefRecommendations);
  }
  if (type === 'interview') {
    return buildInterviewPackage(obligation, riskProfile, chiefRecommendations);
  }
  // Default: assignment / classroom / hackathon / project
  return buildAssignmentPackage(obligation, riskProfile, chiefRecommendations, generateDraft);
}
