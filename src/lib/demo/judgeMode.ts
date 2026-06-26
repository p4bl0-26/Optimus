/**
 * OPTIMUS — Judge Mode / Demo Seeder
 * Phase 8: Judge Experience
 *
 * One-click reset and re-seed of the demo workspace.
 * Inserts a rich, consistent narrative of data that demonstrates
 * every major OPTIMUS capability in a single coherent story.
 *
 * No external APIs called. Pure Supabase upsert.
 * Target: < 2s reset time.
 */

import { supabase } from '../db/supabase';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

// ─── Demo Narrative ───────────────────────────────────────────
// Story: Himank is a university student with a hackathon deadline,
// two major assignments, a client meeting, and a job application —
// all converging on the same overloaded Friday.

const DEMO_OBLIGATIONS = [
  {
    id: 'demo-ob-001',
    user_id: DEMO_USER_ID,
    source: 'gmail',
    source_id: 'gmail-thread-hackathon',
    title: 'Vibe2Ship Hackathon Final Submission',
    description: 'Submit the complete OPTIMUS project including demo video, GitHub repo, and deployment link to the hackathon portal.',
    status: 'pending',
    type: 'deadline',
    priority: 'critical',
    due_date: getFutureDate(1), // Tomorrow
  },
  {
    id: 'demo-ob-002',
    user_id: DEMO_USER_ID,
    source: 'classroom',
    source_id: 'classroom-ml-assignment',
    title: 'Machine Learning Assignment 3 — Neural Networks',
    description: 'Implement a convolutional neural network for image classification. Submit Jupyter notebook with full report.',
    status: 'pending',
    type: 'assignment',
    priority: 'high',
    due_date: getFutureDate(2),
  },
  {
    id: 'demo-ob-003',
    user_id: DEMO_USER_ID,
    source: 'calendar',
    source_id: 'calendar-client-meeting',
    title: 'Client Strategy Meeting — Project Alpha',
    description: 'Present Q3 roadmap and technical architecture to the founding team. Prepare slides and live demo.',
    status: 'pending',
    type: 'meeting',
    priority: 'high',
    due_date: getFutureDate(1),
  },
  {
    id: 'demo-ob-004',
    user_id: DEMO_USER_ID,
    source: 'classroom',
    source_id: 'classroom-os-exam',
    title: 'Operating Systems Mid-Term Examination',
    description: 'Covers chapters 1-8: Process management, memory management, file systems, and concurrency.',
    status: 'pending',
    type: 'exam',
    priority: 'high',
    due_date: getFutureDate(3),
  },
  {
    id: 'demo-ob-005',
    user_id: DEMO_USER_ID,
    source: 'gmail',
    source_id: 'gmail-thread-job',
    title: 'Google Internship Application — Final Deadline',
    description: 'Complete online assessment and submit portfolio project. Referral link expires at 11:59 PM.',
    status: 'pending',
    type: 'application',
    priority: 'medium',
    due_date: getFutureDate(4),
  },
  {
    id: 'demo-ob-006',
    user_id: DEMO_USER_ID,
    source: 'gmail',
    source_id: 'gmail-thread-collab',
    title: 'Research Paper Review — Co-author Response',
    description: 'Respond to reviewer comments on the AI Ethics paper. Three sections require substantial revision.',
    status: 'pending',
    type: 'academic',
    priority: 'medium',
    due_date: getFutureDate(5),
  },
  {
    id: 'demo-ob-007',
    user_id: DEMO_USER_ID,
    source: 'calendar',
    source_id: 'calendar-team-standup',
    title: 'Project Team Standup — Sprint Planning',
    description: 'Weekly sprint planning session. Present progress on the OPTIMUS AI module.',
    status: 'pending',
    type: 'meeting',
    priority: 'low',
    due_date: getFutureDate(1),
  },
  {
    id: 'demo-ob-008',
    user_id: DEMO_USER_ID,
    source: 'classroom',
    source_id: 'classroom-dsa-lab',
    title: 'Data Structures Lab — Graph Algorithms',
    description: 'Implement Dijkstra and A* search algorithms. Submit working code with complexity analysis.',
    status: 'pending',
    type: 'assignment',
    priority: 'low',
    due_date: getFutureDate(6),
  },
  {
    id: 'demo-ob-009',
    user_id: DEMO_USER_ID,
    source: 'gmail',
    source_id: 'gmail-thread-sponsor',
    title: 'Hackathon Sponsor Email — Response Required',
    description: 'Sponsor reached out for post-hackathon collaboration opportunities. Requires professional response.',
    status: 'pending',
    type: 'communication',
    priority: 'medium',
    due_date: getFutureDate(2),
  },
];

const DEMO_RISK_PROFILES = [
  {
    id: 'demo-risk-001',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-001',
    risk_score: 94,
    risk_band: 'Critical',
    reasoning: 'Hackathon deadline is in 24 hours with deployment, demo video, and submission portal tasks all incomplete. No buffer time remains. Miss rate for last-minute hackathon submissions is historically high.',
    recommended_focus: 'Complete deployment to Vercel immediately, then record demo video. All other obligations must be deprioritized until submission.',
    missing_work: 'Demo video recording, final deployment verification, submission portal form',
    future_outcomes: {
      outcomes: [
        { type: 'Recommended', successProbability: 82, summary: 'Submit by 10 PM with full feature demo', projectedResult: 'Strong judge impression, competitive placement' },
        { type: 'Current', successProbability: 61, summary: 'Submit by midnight with partial demo', projectedResult: 'Risk of missing key features in evaluation' },
        { type: 'Danger', successProbability: 18, summary: 'Miss submission deadline', projectedResult: 'Disqualification. All Phase 1-8 work goes unrewarded.' }
      ],
      rescuePlan: {
        actions: {
          today: ['Deploy to Vercel production now', 'Record 3-minute demo video', 'Complete submission form'],
          tomorrow: ['Monitor judge feedback', 'Prepare for Q&A'],
          beforeDeadline: ['Final end-to-end smoke test', 'Verify all OAuth flows work on production']
        }
      },
      factors: ['24-hour deadline', 'Deployment not yet verified', 'Demo video missing', 'Multiple competing obligations on same day']
    }
  },
  {
    id: 'demo-risk-002',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-003',
    risk_score: 78,
    risk_band: 'High Risk',
    reasoning: 'Client presentation scheduled same day as hackathon deadline. Slide deck and live demo not prepared. Conflict with Vibe2Ship submission creates dangerous cognitive overload.',
    recommended_focus: 'Delegate slide preparation to tomorrow morning. Request 30-minute meeting rescheduling if possible.',
    missing_work: 'Presentation slides, live demo environment, Q3 roadmap document',
    future_outcomes: {
      outcomes: [
        { type: 'Recommended', successProbability: 74, summary: 'Reschedule to next week', projectedResult: 'Full preparation time, strong impression' },
        { type: 'Current', successProbability: 45, summary: 'Proceed as scheduled with minimal prep', projectedResult: 'Risk of unprofessional presentation affecting client trust' },
        { type: 'Danger', successProbability: 12, summary: 'Miss meeting without notice', projectedResult: 'Client relationship damage, potential contract risk' }
      ],
      rescuePlan: {
        actions: {
          today: ['Email client requesting 30-min delay', 'Draft 5-slide deck outline'],
          tomorrow: ['Complete slide deck', 'Rehearse demo flow'],
          beforeDeadline: ['Final run-through', 'Confirm meeting platform link']
        }
      },
      factors: ['Day-of scheduling conflict', 'Presentation materials incomplete', 'Cognitive load from hackathon']
    }
  },
  {
    id: 'demo-risk-003',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-002',
    risk_score: 62,
    risk_band: 'High Risk',
    reasoning: 'ML assignment due in 48 hours. Neural network implementation not started. Competing with hackathon deadline for focus time.',
    recommended_focus: 'Begin implementation tonight after hackathon submission. Use transfer learning to reduce implementation time.',
    missing_work: 'CNN implementation, training pipeline, evaluation report',
    future_outcomes: {
      outcomes: [
        { type: 'Recommended', successProbability: 78, summary: 'Start tonight, submit by noon Day 2', projectedResult: 'Full marks possible' },
        { type: 'Current', successProbability: 52, summary: 'Start tomorrow, rush submission', projectedResult: 'Partial credit, quality compromised' },
        { type: 'Danger', successProbability: 8, summary: 'Miss deadline', projectedResult: '0% grade for assignment' }
      ],
      rescuePlan: {
        actions: {
          today: ['Reserve tonight post-hackathon for ML work'],
          tomorrow: ['Implement CNN, run training pipeline'],
          beforeDeadline: ['Write analysis report', 'Submit notebook']
        }
      },
      factors: ['48-hour deadline', 'No implementation started', 'Competing hackathon priority']
    }
  },
  {
    id: 'demo-risk-004',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-004',
    risk_score: 41,
    risk_band: 'Monitor',
    reasoning: 'Exam in 3 days. Study materials available. No immediate action required but monitoring recommended as study time may be compressed.',
    recommended_focus: 'Begin study sessions after hackathon submission. Focus on concurrency chapters which historically cause difficulty.',
    missing_work: 'Chapters 6-8 review, practice problems',
    future_outcomes: {
      outcomes: [
        { type: 'Recommended', successProbability: 85, summary: 'Study 6h over next 2 days', projectedResult: 'Strong exam performance' },
        { type: 'Current', successProbability: 63, summary: 'Study 3h last minute', projectedResult: 'Moderate score, risky on concurrency' },
        { type: 'Danger', successProbability: 22, summary: 'Minimal study due to deadline compression', projectedResult: 'Below-average performance' }
      ],
      rescuePlan: {
        actions: {
          today: ['Schedule study blocks for days 2-3'],
          tomorrow: ['Study chapters 1-5'],
          beforeDeadline: ['Review concurrency and file systems', 'Practice past papers']
        }
      },
      factors: ['3-day runway', 'Manageable scope', 'Known weak area: concurrency']
    }
  },
  {
    id: 'demo-risk-005',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-005',
    risk_score: 29,
    risk_band: 'Monitor',
    reasoning: 'Google internship application due in 4 days. Portfolio project exists but needs polishing. Safe to defer until hackathon concludes.',
    recommended_focus: 'Address after hackathon and ML assignment. Portfolio project can be repurposed from OPTIMUS work.',
    missing_work: 'Portfolio README, online assessment',
    future_outcomes: {
      outcomes: [
        { type: 'Recommended', successProbability: 88, summary: 'Complete assessment Day 4', projectedResult: 'Competitive application' },
        { type: 'Current', successProbability: 71, summary: 'Rush application on Day 4', projectedResult: 'Submitted but possibly incomplete' },
        { type: 'Danger', successProbability: 5, summary: 'Miss deadline', projectedResult: 'Application void' }
      ],
      rescuePlan: {
        actions: {
          today: ['No action required'],
          tomorrow: ['Polish OPTIMUS as portfolio project'],
          beforeDeadline: ['Complete online assessment', 'Submit final application']
        }
      },
      factors: ['4-day runway', 'Portfolio already strong', 'Can defer safely']
    }
  }
];

const DEMO_INTERVENTIONS = [
  {
    id: 'demo-int-001',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-001',
    type: 'Deadline Alert',
    severity: 'critical',
    message: 'CRITICAL: Hackathon final submission due in less than 24 hours. Deployment not yet confirmed. Immediate action required.',
    status: 'pending',
  },
  {
    id: 'demo-int-002',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-003',
    type: 'Conflict',
    severity: 'high',
    message: 'Scheduling conflict detected: Client Strategy Meeting and Hackathon Submission both require full attention on the same day.',
    status: 'pending',
  },
  {
    id: 'demo-int-003',
    user_id: DEMO_USER_ID,
    obligation_id: 'demo-ob-001',
    type: 'Overload',
    severity: 'high',
    message: 'Friday is overloaded. 3 high-priority obligations converge on a single day. Cognitive overload risk is high.',
    status: 'pending',
  },
];

const DEMO_AGENT_MEMORY = [
  {
    id: 'demo-mem-001',
    user_id: DEMO_USER_ID,
    agent_name: 'CHIEF_OF_STAFF',
    memory_type: 'pattern',
    content: {
      pattern: 'Late-stage deadline compression',
      occurrences: 4,
      lastSeen: new Date().toISOString(),
      recommendation: 'Begin work on deliverables at least 72 hours before the deadline to prevent quality degradation under pressure.'
    }
  },
  {
    id: 'demo-mem-002',
    user_id: DEMO_USER_ID,
    agent_name: 'CHIEF_OF_STAFF',
    memory_type: 'pattern',
    content: {
      pattern: 'Meeting-deadline overlap Fridays',
      occurrences: 3,
      lastSeen: new Date().toISOString(),
      recommendation: 'Reserve Fridays as heads-down execution days. Block all meetings by Thursday at the latest.'
    }
  }
];

const DEMO_AGENT_ACTIVITY = [
  {
    id: 'demo-act-001',
    user_id: DEMO_USER_ID,
    agent_name: 'Gmail Discovery Agent',
    obligation_id: 'demo-ob-001',
    action: 'Discovered hackathon submission deadline from email thread. Classified as Critical priority.',
    metadata: { source: 'gmail', thread_id: 'gmail-thread-hackathon', emails_scanned: 47 }
  },
  {
    id: 'demo-act-002',
    user_id: DEMO_USER_ID,
    agent_name: 'Google Classroom Agent',
    obligation_id: 'demo-ob-002',
    action: 'Found 2 pending assignments across 3 courses. ML Neural Networks assignment flagged as high priority.',
    metadata: { source: 'classroom', courses_scanned: 3, assignments_found: 2 }
  },
  {
    id: 'demo-act-003',
    user_id: DEMO_USER_ID,
    agent_name: 'Google Calendar Agent',
    obligation_id: 'demo-ob-003',
    action: 'Detected scheduling conflict: Client meeting overlaps with hackathon deadline window. Intervention generated.',
    metadata: { source: 'calendar', events_scanned: 12, conflicts_detected: 1 }
  },
  {
    id: 'demo-act-004',
    user_id: DEMO_USER_ID,
    agent_name: 'Risk Engine',
    obligation_id: 'demo-ob-001',
    action: 'Risk analysis complete. Score: 94/100 (CRITICAL). Rescue plan generated with 3 priority actions.',
    metadata: { risk_score: 94, band: 'Critical' }
  },
  {
    id: 'demo-act-005',
    user_id: DEMO_USER_ID,
    agent_name: 'Chief of Staff Engine',
    action: 'Executive briefing generated. 3 strategic recommendations produced. Overloaded Friday flagged.',
    metadata: { recommendations: 3, overloaded_days: ['Friday'] }
  }
];

// ─── Helper ───────────────────────────────────────────────────
function getFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

function nowStr(): string {
  return new Date().toISOString();
}

// ─── Main Reset Function ──────────────────────────────────────
export async function resetDemoWorkspace(): Promise<{ success: boolean; message: string; duration: number }> {
  const start = Date.now();

  try {
    // Step 1: Wipe all existing demo data in parallel
    await Promise.all([
      supabase.from('obligations').delete().eq('user_id', DEMO_USER_ID),
      supabase.from('risk_profiles').delete().eq('user_id', DEMO_USER_ID),
      supabase.from('interventions').delete().eq('user_id', DEMO_USER_ID),
      supabase.from('agent_memory').delete().eq('user_id', DEMO_USER_ID),
      supabase.from('agent_activity').delete().eq('user_id', DEMO_USER_ID),
      supabase.from('briefings').delete().eq('user_id', DEMO_USER_ID),
    ]);

    // Step 2: Insert fresh demo data in parallel waves
    const now = nowStr();

    const obligationsWithTimestamps = DEMO_OBLIGATIONS.map(o => ({
      ...o,
      created_at: now,
      updated_at: now,
    }));

    const riskProfilesWithTimestamps = DEMO_RISK_PROFILES.map(r => ({
      ...r,
      created_at: now,
      updated_at: now,
    }));

    const interventionsWithTimestamps = DEMO_INTERVENTIONS.map(i => ({
      ...i,
      created_at: now,
    }));

    const memoryWithTimestamps = DEMO_AGENT_MEMORY.map(m => ({
      ...m,
      created_at: now,
      updated_at: now,
    }));

    const activityWithTimestamps = DEMO_AGENT_ACTIVITY.map(a => ({
      ...a,
      created_at: now,
    }));

    await Promise.all([
      supabase.from('obligations').upsert(obligationsWithTimestamps, { onConflict: 'id' }),
      supabase.from('risk_profiles').upsert(riskProfilesWithTimestamps, { onConflict: 'id' }),
      supabase.from('interventions').upsert(interventionsWithTimestamps, { onConflict: 'id' }),
      supabase.from('agent_memory').upsert(memoryWithTimestamps, { onConflict: 'id' }),
      supabase.from('agent_activity').upsert(activityWithTimestamps, { onConflict: 'id' }),
    ]);

    const duration = Date.now() - start;
    return {
      success: true,
      message: 'OPTIMUS operational state restored.',
      duration,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Demo reset failed.',
      duration: Date.now() - start,
    };
  }
}
