'use server'

import { google } from 'googleapis';
import { getGoogleOAuthClient } from '@/lib/integrations/googleAuth';
import { supabase } from '@/lib/db/supabase';
import { agentActivityRepo, interventionRepo } from '@/lib/repositories';
import { revalidatePath } from 'next/cache';

import { getActiveUserId } from '@/lib/auth';

// Replaced (await getActiveUserId() || '') with activeUserId logic
const CALENDAR_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'https://optimus-gray.vercel.app/api/integrations/calendar/callback';

export async function resolveConflictAction(eventId: string, newStartTime: string) {
  try {
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('access_token, refresh_token')
      .eq('user_id', (await getActiveUserId() || ''))
      .eq('provider', 'calendar')
      .single();

    if (integrationError || !integration?.access_token) {
      throw new Error('Google Calendar not connected.');
    }

    const oauth2Client = getGoogleOAuthClient(CALENDAR_REDIRECT_URI);
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Fetch existing event to find out its duration
    const eventRes = await calendar.events.get({
      calendarId: 'primary',
      eventId: eventId,
    });

    const existingEvent = eventRes.data;
    
    let durationMs = 60 * 60 * 1000; // default 1 hour
    if (existingEvent.start?.dateTime && existingEvent.end?.dateTime) {
      durationMs = new Date(existingEvent.end.dateTime).getTime() - new Date(existingEvent.start.dateTime).getTime();
    }

    const startDateTime = new Date(newStartTime);
    const endDateTime = new Date(startDateTime.getTime() + durationMs);

    // Patch the event
    await calendar.events.patch({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: existingEvent.start?.timeZone || 'UTC'
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: existingEvent.end?.timeZone || 'UTC'
        }
      }
    });

    // Log Activity
    await agentActivityRepo.create({
      user_id: (await getActiveUserId() || ''),
      agent_name: 'calendar_agent',
      action: `Resolved conflict for event ${eventId}. Rescheduled to ${startDateTime.toLocaleString()}`,
      obligation_id: eventId,
      metadata: { eventId, newStartTime: startDateTime.toISOString(), endDateTime: endDateTime.toISOString() }
    });

    // Find and resolve the intervention
    const interventions = await interventionRepo.findAll({
      user_id: (await getActiveUserId() || ''),
      obligation_id: eventId,
      status: 'pending'
    });
    
    for (const inv of interventions) {
      if (inv.type === 'Schedule Conflict Detected' || inv.type === 'Insufficient Preparation Window') {
        await interventionRepo.update(inv.id, { status: 'resolved' });
      }
    }

    revalidatePath('/');
    revalidatePath('/obligations');
    
    return { success: true };
  } catch (err: any) {
    console.error('Error in resolveConflictAction:', err);
    return { success: false, error: err.message };
  }
}
