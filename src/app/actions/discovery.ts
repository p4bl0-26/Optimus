"use server";

import { runDiscoveryAgent } from '@/lib/integrations/discoveryAgent';
import { runClassroomDiscoveryAgent } from '@/lib/integrations/classroomDiscoveryAgent';
import { runCalendarDiscoveryAgent } from '@/lib/integrations/calendarDiscoveryAgent';
import { revalidatePath } from 'next/cache';

export async function runDiscoveryAction() {
  try {
    console.log('[DISCOVERY ACTION] [INFO] Initiating discovery sweep...');
    const result = await runDiscoveryAgent();
    // Revalidate dashboard and obligations list so new items appear instantly
    revalidatePath('/');
    revalidatePath('/obligations');
    console.log(`[DISCOVERY ACTION] [SUCCESS] Sweep complete. Found ${result.newObligations}`);
    return { success: true, newObligations: result.newObligations };
  } catch (error: any) {
    console.log('[DISCOVERY ACTION] [FAIL] Error during discovery action:', error);
    return { success: false, error: error.message };
  }
}

export async function runClassroomDiscoveryAction() {
  try {
    console.log('[CLASSROOM ACTION] [INFO] Initiating Classroom sweep...');
    const result = await runClassroomDiscoveryAgent();
    revalidatePath('/');
    revalidatePath('/obligations');
    console.log(
      `[CLASSROOM ACTION] [SUCCESS] Sweep complete. Found ${result.newObligations} new obligation(s) across ${result.coursesScanned} course(s).`
    );
    return { success: true, newObligations: result.newObligations, coursesScanned: result.coursesScanned };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log('[CLASSROOM ACTION] [FAIL] Error during Classroom sweep:', msg);
    return { success: false, error: msg };
  }
}

export async function runCalendarDiscoveryAction() {
  try {
    console.log('[CALENDAR ACTION] [INFO] Initiating Calendar sweep...');
    const result = await runCalendarDiscoveryAgent();
    revalidatePath('/');
    revalidatePath('/obligations');
    console.log(
      `[CALENDAR ACTION] [SUCCESS] Sweep complete. Found ${result.newObligations} new obligation(s) across ${result.eventsScanned} event(s). Conflicts detected: ${result.conflictsDetected}`
    );
    return { success: true, newObligations: result.newObligations, eventsScanned: result.eventsScanned, conflictsDetected: result.conflictsDetected };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.log('[CALENDAR ACTION] [FAIL] Error during Calendar sweep:', msg);
    return { success: false, error: msg };
  }
}
