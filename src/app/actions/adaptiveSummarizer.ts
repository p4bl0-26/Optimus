'use server';

/**
 * OPTIMUS — Adaptive Executive Summarizer Server Action
 * Phase 10.9 (Final Spec)
 *
 * Single coordinated fetch.
 * Passes futureOutcomes, rescuePlan, formDraft to the engine.
 * No duplicate repository calls.
 */

import { obligationRepo, riskProfileRepo, agentMemoryRepo } from '@/lib/repositories';
import { commandCenterRepo } from '@/lib/repositories/CommandCenterRepository';
import { generateAdaptiveExecutiveSummary } from '@/lib/intelligence/adaptiveExecutiveSummarizer';
import { generateFormDraft } from '@/lib/intelligence/formAssistantEngine';
import { ExecutiveSummaryPackage, FutureOutcome, RescuePlan } from '@/types';

import { getActiveUserId } from '@/lib/auth';

// Replaced (await getActiveUserId() || '') with activeUserId logic

export async function generateAdaptiveSummaryAction(
  obligationId: string
): Promise<{ success: true; data: ExecutiveSummaryPackage } | { success: false; error: string }> {
  try {
    // Single coordinated fetch across all data sources
    const [obligation, riskProfile, dashboardState, memories] = await Promise.all([
      obligationRepo.findById(obligationId),
      riskProfileRepo.findByObligation(obligationId),
      commandCenterRepo.getDashboardState((await getActiveUserId() || '')),
      agentMemoryRepo.findAll({ user_id: (await getActiveUserId() || '') }),
    ]);

    if (!obligation) {
      return { success: false, error: 'Obligation not found in operational database.' };
    }

    const chiefRecommendations = dashboardState.strategicRecommendations ?? [];

    // Extract future outcomes and rescue plan from risk profile's JSONB column
    const futureOutcomes: FutureOutcome[] = riskProfile?.future_outcomes?.outcomes ?? [];
    const rescuePlan: RescuePlan | null = riskProfile?.future_outcomes?.rescuePlan ?? null;

    // For CRITICAL tier only — pre-generate form draft from memory
    const score = riskProfile?.risk_score ?? 0;
    const formDraft = score >= 85 ? generateFormDraft(obligation, memories) : null;

    const pkg = await generateAdaptiveExecutiveSummary(
      obligation,
      riskProfile,
      chiefRecommendations,
      futureOutcomes,
      rescuePlan,
      null,      // workPackage: let Work Accelerator handle independently
      formDraft
    );

    return { success: true, data: pkg };
  } catch (err: any) {
    console.error('[ADAPTIVE_SUMMARIZER][FAIL]', err?.message || err);
    return {
      success: false,
      error: err?.message || 'Failed to generate executive summary.',
    };
  }
}
