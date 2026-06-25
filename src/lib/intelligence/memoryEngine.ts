/**
 * OPTIMUS — Deterministic Memory Engine
 * Phase 7: Chief of Staff Intelligence Layer
 *
 * Provides long-term memory for recurring work patterns, missed commitments,
 * and historical recommendations without using embeddings or vector DBs.
 */

import { agentMemoryRepo } from '../repositories';
import { AgentMemory } from '@/types/database';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export interface MemoryPattern {
  pattern: string;
  occurrences: number;
  lastSeen: string;
  recommendation: string;
}

export async function storeMemoryPattern(pattern: MemoryPattern): Promise<void> {
  // Try to find an existing memory for this pattern
  const existingMemories = await agentMemoryRepo.findAll({
    user_id: DEMO_USER_ID,
    memory_type: 'pattern',
  });

  const existing = existingMemories.find(m => m.content?.pattern === pattern.pattern);

  if (existing) {
    // Update existing
    await agentMemoryRepo.update(existing.id, {
      content: {
        ...existing.content,
        occurrences: (existing.content?.occurrences || 0) + pattern.occurrences,
        lastSeen: pattern.lastSeen,
        recommendation: pattern.recommendation,
      },
      updated_at: new Date().toISOString(),
    });
  } else {
    // Create new
    await agentMemoryRepo.create({
      user_id: DEMO_USER_ID,
      agent_name: 'CHIEF_OF_STAFF',
      memory_type: 'pattern',
      content: pattern,
    });
  }
}

export async function getActivePatterns(): Promise<MemoryPattern[]> {
  const memories = await agentMemoryRepo.findAll({
    user_id: DEMO_USER_ID,
    memory_type: 'pattern',
  });

  return memories.map(m => m.content as MemoryPattern);
}

export async function logHistoricalRecommendation(recommendationTitle: string, reason: string): Promise<void> {
  await agentMemoryRepo.create({
    user_id: DEMO_USER_ID,
    agent_name: 'CHIEF_OF_STAFF',
    memory_type: 'historical_recommendation',
    content: {
      title: recommendationTitle,
      reason,
      timestamp: new Date().toISOString(),
    },
  });
}
