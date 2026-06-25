/**
 * OPTIMUS — Calendar Discovery Agent
 * Phase 6: Google Calendar Integration
 *
 * Responsibilities:
 *   1. Fetch events from Google Calendar API (next 30 days)
 *   2. Filter and categorize events
 *   3. Deduplicate against existing obligations
 *   4. Map event → Obligation
 *   5. Invoke EXISTING intelligence stack (processObligation)
 *   6. Persist results
 *   7. Run conflict intelligence (Interventions only, NO new scheduling engine)
 */

import { google, calendar_v3 } from 'googleapis';
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
const CALENDAR_REDIRECT_URI =
  process.env.GOOGLE_CALENDAR_REDIRECT_URI ||
  'http://localhost:3000/api/integrations/calendar/callback';

// ─── Helpers ──────────────────────────────────────────────────

function categorizeEvent(summary: string = ''): { type: string; priority: string } {
  const s = summary.toLowerCase();
  if (s.includes('exam') || s.includes('midterm') || s.includes('final')) {
    return { type: 'exam', priority: 'critical' };
  }
  if (s.includes('interview')) {
    return { type: 'meeting', priority: 'high' };
  }
  if (s.includes('deadline') || s.includes('due') || s.includes('submission')) {
    return { type: 'deadline', priority: 'high' };
  }
  if (s.includes('class') || s.includes('lecture') || s.includes('tutorial')) {
    return { type: 'class', priority: 'medium' };
  }
  if (s.includes('meeting') || s.includes('sync') || s.includes('1:1')) {
    return { type: 'meeting', priority: 'medium' };
  }
  return { type: 'personal', priority: 'low' };
}

function priorityToImportance(priority: string): ImportanceLevel {
  switch (priority.toLowerCase()) {
    case 'high': return 'High';
    case 'critical': return 'Critical';
    case 'low': return 'Low';
    default: return 'Medium';
  }
}

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
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    importance: priorityToImportance(dbObligation.priority),
    progress: 0,
    createdAt: new Date(dbObligation.created_at),
    updatedAt: new Date(dbObligation.updated_at),
  };
}

// ─── Conflict Intelligence Helpers ──────────────────────────────
async function runConflictIntelligence(events: calendar_v3.Schema$Event[]) {
  // Sort events by start time
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.start?.dateTime ?? 0).getTime();
    const timeB = new Date(b.start?.dateTime ?? 0).getTime();
    return timeA - timeB;
  });

  const conflictsDetected = { overlapping: 0, clusters: 0, lowBuffer: 0 };

  // 1. Overlapping Critical Events
  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const current = sortedEvents[i];
    const next = sortedEvents[i + 1];
    
    const catCurrent = categorizeEvent(current.summary ?? '');
    const catNext = categorizeEvent(next.summary ?? '');
    
    // Check if either is high/critical
    if (catCurrent.priority === 'critical' || catCurrent.priority === 'high' || catNext.priority === 'critical' || catNext.priority === 'high') {
      const currentEnd = new Date(current.end?.dateTime ?? 0).getTime();
      const nextStart = new Date(next.start?.dateTime ?? 0).getTime();
      
      if (nextStart < currentEnd) {
        await interventionRepo.create({
          user_id: DEMO_USER_ID,
          obligation_id: current.id || 'system-conflict', // Ideally link to obligation id if known, but this is a broad conflict
          type: 'Schedule Conflict Detected',
          severity: 'Critical',
          message: `Overlap between "${current.summary}" and "${next.summary}". Immediate rescheduling advised.`,
          status: 'pending',
        });
        conflictsDetected.overlapping++;
      }
    }
  }

  // 2. Multiple Major Deadlines Same Day
  const deadlinesByDay: Record<string, string[]> = {};
  for (const event of sortedEvents) {
    const { type, priority } = categorizeEvent(event.summary ?? '');
    if ((type === 'deadline' || type === 'exam') && (priority === 'high' || priority === 'critical')) {
      const dateKey = new Date(event.start?.dateTime ?? 0).toISOString().split('T')[0];
      if (!deadlinesByDay[dateKey]) deadlinesByDay[dateKey] = [];
      deadlinesByDay[dateKey].push(event.summary ?? 'Unknown Event');
    }
  }

  for (const [date, eventsOnDay] of Object.entries(deadlinesByDay)) {
    if (eventsOnDay.length > 1) {
      await interventionRepo.create({
        user_id: DEMO_USER_ID,
        obligation_id: 'system-conflict',
        type: 'Deadline Cluster Detected',
        severity: 'High',
        message: `Multiple major commitments on ${date}: ${eventsOnDay.join(', ')}. Begin preparation early.`,
        status: 'pending',
      });
      conflictsDetected.clusters++;
    }
  }

  // 3. Less Than 2 Hours Before Major Event
  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];
    const cat = categorizeEvent(event.summary ?? '');
    
    if (cat.priority === 'critical' || cat.priority === 'high') {
      const eventStart = new Date(event.start?.dateTime ?? 0).getTime();
      let freeTimeBefore = Infinity;
      
      if (i > 0) {
        const prevEventEnd = new Date(sortedEvents[i - 1].end?.dateTime ?? 0).getTime();
        freeTimeBefore = eventStart - prevEventEnd;
      }
      
      const twoHoursMs = 2 * 60 * 60 * 1000;
      if (freeTimeBefore > 0 && freeTimeBefore < twoHoursMs) {
        await interventionRepo.create({
          user_id: DEMO_USER_ID,
          obligation_id: event.id || 'system-conflict',
          type: 'Insufficient Preparation Window',
          severity: 'High',
          message: `Less than 2 hours free before major event: "${event.summary}". Recommend clearing schedule prior to event.`,
          status: 'pending',
        });
        conflictsDetected.lowBuffer++;
      }
    }
  }
  
  return conflictsDetected;
}

// ─── Main Export ───────────────────────────────────────────────
export async function runCalendarDiscoveryAgent() {
  console.log('[CALENDAR AGENT] Booting up...');

  // 1. Retrieve Calendar integration tokens
  const { data: integration, error: integrationError } = await supabase
    .from('integrations')
    .select('access_token, refresh_token')
    .eq('user_id', DEMO_USER_ID)
    .eq('provider', 'calendar')
    .single();

  if (integrationError || !integration?.access_token) {
    console.error('[CALENDAR AGENT] [FAIL] Calendar not connected — missing tokens.', integrationError);
    throw new Error('Google Calendar not connected. Please authorize via Connect Calendar.');
  }

  // 2. Initialize OAuth client
  const oauth2Client = getGoogleOAuthClient(CALENDAR_REDIRECT_URI);
  oauth2Client.setCredentials({
    access_token: integration.access_token,
    refresh_token: integration.refresh_token,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // 3. Fetch events (next 30 days)
  console.log('[CALENDAR AGENT] [INFO] Fetching events for the next 30 days...');
  let eventsRes;
  try {
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    eventsRes = await calendar.events.list({
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[CALENDAR AGENT] [FAIL] Failed to fetch events:', msg);
    throw new Error(`Calendar API error: ${msg}`);
  }

  const rawEvents = eventsRes.data.items ?? [];
  
  // 4. Filter events
  const validEvents = rawEvents.filter(event => {
    if (!event.summary) return false;
    const s = event.summary.toLowerCase();
    if (s.includes('birthday') || s.includes('holiday')) return false;
    // Exclude all-day events (they have start.date instead of start.dateTime)
    if (event.start?.date && !event.start?.dateTime) return false;
    return true;
  });

  if (validEvents.length === 0) {
    console.log('[CALENDAR AGENT] [INFO] No valid upcoming events found.');
    return { status: 'success', eventsScanned: 0, newObligations: 0, conflictsDetected: 0 };
  }

  console.log(`[CALENDAR AGENT] [INFO] Processing ${validEvents.length} valid events.`);

  let newObligationsCount = 0;

  // 5. Process events -> obligations
  for (const event of validEvents) {
    if (!event.id) continue;

    try {
      // Deduplication
      const { data: existing } = await supabase
        .from('obligations')
        .select('id')
        .eq('source', 'calendar')
        .eq('source_id', event.id)
        .single();

      if (existing) {
        // console.log(`[CALENDAR AGENT] [SKIP] Already imported: ${event.summary}`);
        continue;
      }

      const category = categorizeEvent(event.summary ?? undefined);
      const dueDateISO = event.start?.dateTime;

      console.log(`[CALENDAR AGENT] Discovered new event: ${event.summary ?? 'Untitled Event'}`);

      // Create DB obligation
      const dbObligation = await obligationRepo.create({
        user_id: DEMO_USER_ID,
        title: event.summary ?? 'Untitled Event',
        description: event.description ?? event.summary ?? 'Untitled Event',
        source: 'calendar',
        source_id: event.id,
        status: 'pending',
        type: category.type,
        priority: category.priority,
        due_date: dueDateISO ?? undefined,
      });

      if (!dbObligation) {
        console.error(`[CALENDAR AGENT] [FAIL] Failed to create obligation for event: ${event.id}`);
        continue;
      }

      console.log(`[CALENDAR AGENT] Created obligation: ${dbObligation.title}`);

      // ── INVOKE EXISTING INTELLIGENCE STACK ──────────────────
      const intelObligation = toIntelObligation(dbObligation);
      const decision = processObligation(intelObligation);

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

      await briefingRepo.create({
        user_id: DEMO_USER_ID,
        briefing_type: 'discovery',
        content: {
          title: 'Calendar Obligation Discovered',
          message: `OPTIMUS has extracted "${dbObligation.title}" from Google Calendar. ${decision.risk.reasoning}`,
        },
        read_status: false,
        generated_at: new Date().toISOString(),
      });

      if (decision.risk.band === 'Critical' || decision.risk.band === 'High Risk') {
        const immediateAction = decision.rescuePlan.actions.today[0] ?? 'Begin preparation today.';
        await interventionRepo.create({
          user_id: DEMO_USER_ID,
          obligation_id: dbObligation.id,
          type: 'risk_alert',
          severity: decision.risk.band === 'Critical' ? 'critical' : 'high',
          message: `${decision.risk.band} — ${dbObligation.title}: ${immediateAction}`,
          status: 'pending',
        });
      }

      await agentActivityRepo.create({
        user_id: DEMO_USER_ID,
        agent_name: 'CALENDAR AGENT',
        action: `Discovered and processed event: ${dbObligation.title}`,
        obligation_id: dbObligation.id,
        metadata: {
          eventId: event.id,
          riskBand: decision.risk.band,
          riskScore: decision.risk.score,
          recommendedAction: decision.recommendedAction,
        },
      });

      newObligationsCount++;
    } catch (cwError: unknown) {
      const msg = cwError instanceof Error ? cwError.message : String(cwError);
      console.error(`[CALENDAR AGENT] [FAIL] Error processing event ${event.id}: ${msg}`);
    }
  }

  // 6. Run Conflict Intelligence
  console.log('[CALENDAR AGENT] Running conflict intelligence...');
  const conflictStats = await runConflictIntelligence(validEvents);
  const totalConflicts = conflictStats.clusters + conflictStats.lowBuffer + conflictStats.overlapping;
  
  if (totalConflicts > 0) {
    console.log(`[CALENDAR AGENT] Generated ${totalConflicts} conflict interventions.`);
  }

  console.log(
    `[CALENDAR AGENT] [SUCCESS] Sweep complete. Events scanned: ${validEvents.length}. New obligations: ${newObligationsCount}. Conflicts: ${totalConflicts}`
  );
  return { 
    status: 'success', 
    eventsScanned: validEvents.length, 
    newObligations: newObligationsCount,
    conflictsDetected: totalConflicts 
  };
}
