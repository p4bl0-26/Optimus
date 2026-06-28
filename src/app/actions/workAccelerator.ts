'use server';

/**
 * OPTIMUS — Work Accelerator Server Actions
 * Phase 10.8
 *
 * ONE repository call → pass data to engine → return package.
 * NO duplicate fetches. NO automatic submissions. HUMAN APPROVAL MANDATORY.
 */

import { obligationRepo, riskProfileRepo, agentMemoryRepo } from '@/lib/repositories';
import { commandCenterRepo } from '@/lib/repositories/CommandCenterRepository';
import { generateWorkAccelerationPackage } from '@/lib/intelligence/workAccelerationEngine';
import { generateFormDraft } from '@/lib/intelligence/formAssistantEngine';
import { WorkAccelerationPackage, FormDraft } from '@/types';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

// ─── Action 1: Work Acceleration Package ─────────────────────
export async function generateAccelerationPackageAction(
  obligationId: string,
  generateDraft = true
): Promise<{ success: true; data: WorkAccelerationPackage } | { success: false; error: string }> {
  try {
    // Single fetch — reuse CommandCenterRepository
    const [obligation, riskProfile, dashboardState] = await Promise.all([
      obligationRepo.findById(obligationId),
      riskProfileRepo.findByObligation(obligationId),
      commandCenterRepo.getDashboardState(DEMO_USER_ID),
    ]);

    if (!obligation) {
      return { success: false, error: 'Obligation not found.' };
    }

    const chiefRecommendations = dashboardState.strategicRecommendations ?? [];

    const pkg = await generateWorkAccelerationPackage(
      obligation,
      riskProfile,
      chiefRecommendations,
      generateDraft
    );

    return { success: true, data: pkg };
  } catch (err: any) {
    console.error('[WORK_ACCELERATOR][FAIL]', err?.message || err);
    return { success: false, error: err?.message || 'Failed to generate acceleration package.' };
  }
}

// ─── Action 2: Form Draft ────────────────────────────────────
export async function generateFormDraftAction(
  obligationId: string
): Promise<{ success: true; data: FormDraft } | { success: false; error: string }> {
  try {
    const [obligation, memories] = await Promise.all([
      obligationRepo.findById(obligationId),
      agentMemoryRepo.findAll({ user_id: DEMO_USER_ID }),
    ]);

    if (!obligation) {
      return { success: false, error: 'Obligation not found.' };
    }

    // previousApplications: sourced from obligations with matching form type (extensible)
    const previousApplications: any[] = [];

    const draft = generateFormDraft(obligation, memories, previousApplications);

    return { success: true, data: draft };
  } catch (err: any) {
    console.error('[FORM_ASSISTANT][FAIL]', err?.message || err);

    return { success: false, error: err?.message || 'Failed to generate form draft.' };
  }
}
