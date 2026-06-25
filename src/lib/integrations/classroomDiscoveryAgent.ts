/**
 * OPTIMUS — Classroom Discovery Agent
 * Phase 5: Google Classroom Integration
 *
 * Responsibilities (and ONLY these):
 *   1. Fetch courses from Google Classroom API
 *   2. Fetch coursework for each course
 *   3. Deduplicate against existing obligations (source=classroom, source_id=coursework.id)
 *   4. Map coursework → Obligation (database record)
 *   5. Insert obligation into Supabase via obligationRepo
 *   6. Invoke the EXISTING intelligence stack (processObligation → Decision)
 *   7. Persist RiskProfile, FutureOutcomes, RescuePlan via existing repos
 *   8. Generate Briefing entry via existing repos
 *   9. Generate Intervention if Critical/High Risk
 *  10. Log agent activity
 *
 * No custom risk formulas. No Classroom-specific scoring.
 * One unified Chief of Staff.
 */

import { google } from 'googleapis';
import { getGoogleOAuthClient } from './googleAuth';
import { supabase } from '../db/supabase';
import {
  obligationRepo,
  riskProfileRepo,
  briefingRepo,
  agentActivityRepo,
  interventionRepo,
} from '../repositories';
import { processObligation } from '../intelligence';
import { Obligation as IntelObligation, ImportanceLevel } from '@/types';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';
const CLASSROOM_REDIRECT_URI =
  process.env.GOOGLE_CLASSROOM_REDIRECT_URI ||
  'http://localhost:3000/api/integrations/classroom/callback';

// ─── Priority → ImportanceLevel mapping ───────────────────────
function priorityToImportance(priority: string): ImportanceLevel {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'High';
    case 'critical':
      return 'Critical';
    case 'low':
      return 'Low';
    default:
      return 'Medium';
  }
}

// ─── Derive priority from coursework metadata ──────────────────
function derivePriority(maxPoints: number | null | undefined, daysUntilDue: number | null): string {
  if (daysUntilDue !== null && daysUntilDue <= 1) return 'critical';
  if (daysUntilDue !== null && daysUntilDue <= 3) return 'high';
  if (maxPoints !== null && maxPoints !== undefined && maxPoints >= 100) return 'high';
  if (daysUntilDue !== null && daysUntilDue <= 7) return 'medium';
  return 'low';
}

// ─── Convert Google Classroom dueDate object → ISO string ─────
// coursework.dueDate = { year, month, day } (UTC midnight)
function buildDueDate(dueDate?: { year?: number; month?: number; day?: number } | null): string | undefined {
  if (!dueDate?.year || !dueDate?.month || !dueDate?.day) return undefined;
  const isoDate = new Date(
    Date.UTC(dueDate.year, dueDate.month - 1, dueDate.day, 23, 59, 0)
  ).toISOString();
  return isoDate;
}

// ─── Days until due (returns null if no due date) ─────────────
function daysUntilDue(dueDate?: { year?: number; month?: number; day?: number } | null): number | null {
  if (!dueDate?.year || !dueDate?.month || !dueDate?.day) return null;
  const due = new Date(Date.UTC(dueDate.year, dueDate.month - 1, dueDate.day, 23, 59, 0));
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Build an intel-layer Obligation from DB obligation ────────
// The intelligence stack expects @/types Obligation (not database Obligation).
function toIntelObligation(dbObligation: {
  id: string;
  title: string;
  description?: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}): IntelObligation {
  return {
    id: dbObligation.id,
    title: dbObligation.title,
    description: dbObligation.description ?? dbObligation.title,
    deadline: dbObligation.due_date
      ? new Date(dbObligation.due_date)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14-day default
    importance: priorityToImportance(dbObligation.priority),
    progress: 0, // New discovery — always 0% to start
    createdAt: new Date(dbObligation.created_at),
    updatedAt: new Date(dbObligation.updated_at),
  };
}

// ─── Main Export ───────────────────────────────────────────────
export async function runClassroomDiscoveryAgent() {
  console.log('[CLASSROOM AGENT] Booting up...');

  // 1. Retrieve Classroom integration tokens
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('access_token, refresh_token')
    .eq('user_id', DEMO_USER_ID)
    .eq('provider', 'classroom')
    .single();

  if (integrationError || !integration?.access_token) {
    console.error('[CLASSROOM AGENT] [FAIL] Classroom not connected — missing tokens.', integrationError);
    throw new Error('Google Classroom not connected. Please authorize via Connect Classroom.');
  }

  // 2. Initialize OAuth client with Classroom tokens
  const oauth2Client = getGoogleOAuthClient(CLASSROOM_REDIRECT_URI);
  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
  });

  const classroom = google.classroom({ version: 'v1', auth: oauth2Client });

  // 3. Fetch active courses
  console.log('[CLASSROOM AGENT] [INFO] Fetching courses...');
  let coursesRes;
  try {
    coursesRes = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 20,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[CLASSROOM AGENT] [FAIL] Failed to fetch courses:', msg);
    throw new Error(`Classroom API error (courses.list): ${msg}`);
  }

  const courses = coursesRes.data.courses ?? [];
  if (courses.length === 0) {
    console.log('[CLASSROOM AGENT] [INFO] No active courses found.');
    return { status: 'success', coursesScanned: 0, newObligations: 0 };
  }

  console.log(`[CLASSROOM AGENT] [INFO] Found ${courses.length} active course(s).`);

  let newObligationsCount = 0;

  // 4. Iterate courses → fetch coursework
  for (const course of courses) {
    if (!course.id || !course.name) continue;

    console.log(`[CLASSROOM AGENT] [INFO] Scanning coursework for: ${course.name}`);

    let courseworkRes;
    try {
      courseworkRes = await classroom.courses.courseWork.list({
        courseId: course.id,
        courseWorkStates: ['PUBLISHED'],
        orderBy: 'dueDate asc',
        pageSize: 30,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[CLASSROOM AGENT] [WARN] Failed to fetch coursework for ${course.name}: ${msg}`);
      continue;
    }

    const courseworkItems = courseworkRes.data.courseWork ?? [];
    if (courseworkItems.length === 0) {
      console.log(`[CLASSROOM AGENT] [INFO] No coursework found for: ${course.name}`);
      continue;
    }

    // 5. Process each coursework item
    for (const cw of courseworkItems) {
      if (!cw.id) continue;

      try {
        // 5a. Deduplication — source=classroom, source_id=cw.id
        const { data: existing } = await supabase
          .from('obligations')
          .select('id')
          .eq('source', 'classroom')
          .eq('source_id', cw.id)
          .single();

        if (existing) {
          console.log(`[CLASSROOM AGENT] [SKIP] Already imported: ${cw.title}`);
          continue;
        }

        // 5b. Compute metadata
        const dueDateISO = buildDueDate(cw.dueDate as { year?: number; month?: number; day?: number } | null | undefined);
        const days = daysUntilDue(cw.dueDate as { year?: number; month?: number; day?: number } | null | undefined);
        const priority = derivePriority(cw.maxPoints ?? null, days);

        console.log(`[CLASSROOM AGENT] Discovered new coursework: ${cw.title} (Course: ${course.name})`);

        // 5c. Create DB obligation
        const dbObligation = await obligationRepo.create({
          user_id: DEMO_USER_ID,
          title: cw.title ?? 'Untitled Assignment',
          description: cw.description ?? `Coursework from ${course.name}`,
          source: 'classroom',
          source_id: cw.id,
          status: 'pending',
          type: 'academic',
          priority,
          due_date: dueDateISO,
        });

        if (!dbObligation) {
          console.error(`[CLASSROOM AGENT] [FAIL] Failed to create obligation for coursework: ${cw.id}`);
          continue;
        }

        console.log(`[CLASSROOM AGENT] Created obligation: ${dbObligation.title}`);

        // ── INVOKE EXISTING INTELLIGENCE STACK ──────────────────
        // 5d. Build intel-layer obligation and run processObligation
        const intelObligation = toIntelObligation(dbObligation);
        const decision = processObligation(intelObligation);

        // 5e. Persist RiskProfile (using existing riskProfileRepo)
        await riskProfileRepo.create({
          user_id: DEMO_USER_ID,
          obligation_id: dbObligation.id,
          risk_score: decision.risk.score,
          risk_band: decision.risk.band,
          reasoning: decision.risk.reasoning,
          recommended_focus: decision.risk.recommendedFocus,
          missing_work: decision.risk.missingWork.join('; '),
          future_outcomes: {
            factors: decision.risk.factors,
            outcomes: decision.outcomes.map((o) => ({
              type: o.type,
              summary: o.summary,
              successProbability: o.successProbability,
              projectedResult: o.projectedResult,
            })),
            rescuePlan: {
              recoveryStrategy: decision.rescuePlan.recoveryStrategy,
              actions: decision.rescuePlan.actions,
            },
          },
        });

        console.log(
          `[CLASSROOM AGENT] Risk score updated: ${decision.risk.score} (${decision.risk.band})`
        );

        // 5f. Persist Briefing entry
        await briefingRepo.create({
          user_id: DEMO_USER_ID,
          briefing_type: 'discovery',
          content: {
            title: 'Classroom Obligation Discovered',
            message: `OPTIMUS has extracted "${dbObligation.title}" from Google Classroom (${course.name}). ${decision.risk.reasoning}`,
          },
          read_status: false,
          generated_at: new Date().toISOString(),
        });

        // 5g. Generate Intervention if Critical or High Risk
        if (decision.risk.band === 'Critical' || decision.risk.band === 'High Risk') {
          const immediateAction =
            decision.rescuePlan.actions.today[0] ?? 'Begin implementation today.';

          await interventionRepo.create({
            user_id: DEMO_USER_ID,
            obligation_id: dbObligation.id,
            type: 'risk_alert',
            severity: decision.risk.band === 'Critical' ? 'critical' : 'high',
            message: `${decision.risk.band} — ${dbObligation.title}: ${immediateAction}`,
            status: 'pending',
          });

          console.log(
            `[CLASSROOM AGENT] Generated intervention: ${immediateAction}`
          );
        }

        // 5h. Log agent activity
        await agentActivityRepo.create({
          user_id: DEMO_USER_ID,
          agent_name: 'CLASSROOM AGENT',
          action: `Discovered and processed coursework: ${dbObligation.title}`,
          obligation_id: dbObligation.id,
          metadata: {
            courseId: course.id,
            courseName: course.name,
            courseworkId: cw.id,
            riskBand: decision.risk.band,
            riskScore: decision.risk.score,
            recommendedAction: decision.recommendedAction,
          },
        });

        newObligationsCount++;
      } catch (cwError: unknown) {
        const msg = cwError instanceof Error ? cwError.message : String(cwError);
        console.error(`[CLASSROOM AGENT] [FAIL] Error processing coursework ${cw.id}: ${msg}`);
      }
    }
  }

  console.log(
    `[CLASSROOM AGENT] [SUCCESS] Sweep complete. Courses scanned: ${courses.length}. New obligations: ${newObligationsCount}.`
  );
  return { status: 'success', coursesScanned: courses.length, newObligations: newObligationsCount };
}
