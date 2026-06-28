"use server";

import { revalidatePath } from 'next/cache';
import { 
  obligationRepo, 
  riskProfileRepo, 
  interventionRepo,
  agentActivityRepo,
  briefingRepo
} from '@/lib/repositories';
import { Obligation, RiskProfile, Intervention, AgentActivity, Briefing } from '@/types/database';

// A constant Demo User ID since there's no auth yet
import { getActiveUserId } from '@/lib/auth';

// Replaced (await getActiveUserId() || '') with activeUserId logic

import { commandCenterRepo } from '@/lib/repositories/CommandCenterRepository';

// --- Dashboard Aggregation ---
export async function fetchDashboardStateAction() {
  return await commandCenterRepo.getDashboardState((await getActiveUserId() || ''));
}

// --- Obligations ---
export async function fetchObligationsAction(): Promise<Obligation[]> {
  return await obligationRepo.findByUser((await getActiveUserId() || ''));
}

export async function createObligationAction(data: Omit<Obligation, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const newObligation = await obligationRepo.create({
    ...data,
    user_id: (await getActiveUserId() || '')
  });
  revalidatePath('/obligations');
  revalidatePath('/');
  return newObligation;
}

export async function updateObligationStatusAction(id: string, status: string) {
  const updated = await obligationRepo.update(id, { status });
  revalidatePath('/obligations');
  revalidatePath('/');
  return updated;
}

// --- Risk Profiles ---
export async function fetchRiskProfileForObligationAction(obligationId: string): Promise<RiskProfile | null> {
  return await riskProfileRepo.findByObligation(obligationId);
}

export async function upsertRiskProfileAction(data: Omit<RiskProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const existing = await riskProfileRepo.findByObligation(data.obligation_id);
  
  let result;
  if (existing) {
    result = await riskProfileRepo.update(existing.id, data);
  } else {
    result = await riskProfileRepo.create({
      ...data,
      user_id: (await getActiveUserId() || '')
    });
  }
  revalidatePath('/obligations');
  revalidatePath('/');
  return result;
}

// --- Interventions ---
export async function fetchActiveInterventionsAction(): Promise<Intervention[]> {
  return await interventionRepo.findActiveByUser((await getActiveUserId() || ''));
}

export async function createInterventionAction(data: Omit<Intervention, 'id' | 'user_id' | 'created_at'>) {
  const newIntervention = await interventionRepo.create({
    ...data,
    user_id: (await getActiveUserId() || '')
  });
  revalidatePath('/');
  return newIntervention;
}

export async function resolveInterventionAction(id: string) {
  const updated = await interventionRepo.update(id, { status: 'resolved' });
  revalidatePath('/');
  return updated;
}

// --- Agent Activity ---
export async function logAgentActivityAction(data: Omit<AgentActivity, 'id' | 'user_id' | 'created_at'>) {
  const activity = await agentActivityRepo.create({
    ...data,
    user_id: (await getActiveUserId() || '')
  });
  revalidatePath('/');
  return activity;
}

export async function fetchRecentAgentActivityAction(): Promise<AgentActivity[]> {
  return await agentActivityRepo.findAll({ user_id: (await getActiveUserId() || '') });
}

// --- Briefings ---
export async function fetchLatestBriefingAction(type: string): Promise<Briefing | null> {
  const briefings = await briefingRepo.findAll({ user_id: (await getActiveUserId() || ''), briefing_type: type });
  // Sorting will be implemented directly via SQL later if necessary, but this suffices for MVP
  return briefings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;
}
