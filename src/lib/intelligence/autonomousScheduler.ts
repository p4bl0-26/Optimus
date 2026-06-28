import { Obligation, RiskProfile, Intervention } from '@/types/database';
import { StrategicRecommendation, ScheduledBlock, WeeklySchedule, RiskAnalysis, Obligation as CoreObligation } from '@/types';
import { MemoryPattern } from './memoryEngine';
import { generateRescuePlan } from './rescuePlanEngine';
import { interventionRepo } from '../repositories';

// Helper to normalize memory patterns
function normalizePatternType(patternStr: string): string {
  const upper = patternStr.toUpperCase();
  if (upper.includes('ACADEMIC') && upper.includes('CLUSTER')) return 'ACADEMIC_CLUSTER';
  if (upper.includes('EVENING') && upper.includes('DROP')) return 'EVENING_PRODUCTIVITY_DROP';
  if (upper.includes('DELAY') || upper.includes('POSTPONED')) return 'REPEATED_DELAY';
  return 'UNKNOWN';
}

export async function generateWeeklySchedule(
  obligations: Obligation[],
  riskProfiles: RiskProfile[],
  interventions: Intervention[],
  memoryPatterns: MemoryPattern[],
  chiefRecommendations: StrategicRecommendation[]
): Promise<WeeklySchedule> {
  const blocks: ScheduledBlock[] = [];
  const criticalWarnings: string[] = [];
  
  // 1. Calculate average risk & Crisis mode triggers
  const pendingProfiles = riskProfiles.filter(p => 
    obligations.find(o => o.id === p.obligation_id && o.status !== 'completed')
  );
  
  const averageRisk = pendingProfiles.length > 0 
    ? pendingProfiles.reduce((acc, p) => acc + p.risk_score, 0) / pendingProfiles.length 
    : 0;

  const criticalCount = pendingProfiles.filter(p => p.risk_band === 'Critical').length;
  
  // Quick overloaded days check
  const dayCounts: Record<string, number> = {};
  obligations.forEach(ob => {
    if (!ob.due_date || ob.status === 'completed') return;
    const dateStr = new Date(ob.due_date).toLocaleDateString('en-US', { weekday: 'long' });
    const profile = riskProfiles.find(p => p.obligation_id === ob.id);
    if (profile && profile.risk_score >= 70) {
      dayCounts[dateStr] = (dayCounts[dateStr] || 0) + 1;
    }
  });
  const overloadedDays = Object.keys(dayCounts).filter(day => dayCounts[day] > 3);

  // Crisis Mode triggers
  if (averageRisk > 85 || criticalCount >= 3 || overloadedDays.length > 1) {
    criticalWarnings.push('CRISIS MODE ACTIVATED: Immediate execution required.');
  }

  // 2. Sort obligations into priority buckets
  const sortedObligations = [...obligations.filter(o => o.status !== 'completed')].sort((a, b) => {
    const pA = riskProfiles.find(p => p.obligation_id === a.id);
    const pB = riskProfiles.find(p => p.obligation_id === b.id);
    const riskScoreA = pA?.risk_score || 0;
    const riskScoreB = pB?.risk_score || 0;
    
    const getPriorityTier = (ob: Obligation, riskScore: number, band: string | undefined): number => {
      // Memory Overrides
      const isRepeatedlyDelayed = memoryPatterns.some(m => 
        normalizePatternType(m.pattern) === 'REPEATED_DELAY' && m.pattern.includes(ob.title)
      );
      if (isRepeatedlyDelayed) return 0; // Highest priority due to memory

      if (band === 'Critical') return 1;
      if (band === 'High Risk') return 2;
      
      const isChiefRec = chiefRecommendations.some(r => r.recommendation.includes(ob.title));
      if (isChiefRec) return 3;
      
      if (ob.source === 'calendar') return 4;
      if (ob.source === 'canvas' || ob.source === 'classroom') return 5;
      
      return 6;
    };

    const tierA = getPriorityTier(a, riskScoreA, pA?.risk_band);
    const tierB = getPriorityTier(b, riskScoreB, pB?.risk_band);
    
    if (tierA !== tierB) return tierA - tierB;
    return riskScoreB - riskScoreA; // Tie-breaker by raw risk score
  });

  // 3. Generate 90-minute Deep Work Blocks
  const currentDate = new Date();
  currentDate.setHours(9, 0, 0, 0);
  
  // Apply ACADEMIC_CLUSTER
  const academicCluster = memoryPatterns.some(m => normalizePatternType(m.pattern) === 'ACADEMIC_CLUSTER');
  if (academicCluster) {
    sortedObligations.sort((a, b) => {
      if (a.source === 'canvas' && b.source !== 'canvas') return -1;
      if (a.source !== 'canvas' && b.source === 'canvas') return 1;
      return 0;
    });
  }

  const avoidEvening = memoryPatterns.some(m => normalizePatternType(m.pattern) === 'EVENING_PRODUCTIVITY_DROP');

  for (const ob of sortedObligations) {
    const coreOb: CoreObligation = {
      id: ob.id,
      title: ob.title,
      description: ob.description || '',
      deadline: ob.due_date ? new Date(ob.due_date) : new Date(Date.now() + 86400000),
      importance: (ob.priority as any) || 'Medium',
      progress: 0,
      createdAt: new Date(ob.created_at),
      updatedAt: new Date(ob.updated_at),
    };
    
    const profile = riskProfiles.find(p => p.obligation_id === ob.id);
    const riskAnalysis: RiskAnalysis = {
      score: profile?.risk_score || 0,
      band: (profile?.risk_band as any) || 'Safe',
      reasoning: profile?.reasoning || 'No critical issues.',
      factors: [],
      missingWork: [],
      recommendedFocus: '',
      timePressureAnalysis: '',
      completionHealth: ''
    };

    const rescuePlan = generateRescuePlan(coreOb, riskAnalysis);
    
    // Check evening hours
    if (avoidEvening && currentDate.getHours() >= 19) {
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(9, 0, 0, 0);
    }

    const startStr = currentDate.toISOString();
    currentDate.setMinutes(currentDate.getMinutes() + 90);
    const endStr = currentDate.toISOString();

    blocks.push({
      id: `block-${ob.id}-${Date.now()}`,
      obligationId: ob.id,
      title: ob.title,
      source: ob.source,
      riskBand: profile?.risk_band || 'Safe',
      startTime: startStr,
      endTime: endStr,
      confidence: Math.round(Math.max(50, 100 - (profile?.risk_score || 0) * 0.4)),
      reason: rescuePlan.immediatePriorities[0] || profile?.reasoning || 'Scheduled based on priority tier.'
    });

    if (ob.due_date) {
      const dueTime = new Date(ob.due_date).getTime();
      const prepTime = dueTime - currentDate.getTime();
      if (prepTime > 0 && prepTime < 2 * 60 * 60 * 1000) {
        criticalWarnings.push(`Tight window: Less than 2 hours before ${ob.title} deadline.`);
        const msg = `Insufficient preparation window for ${ob.title}.`;
        if (!interventions.find(i => i.message === msg)) {
          interventionRepo.create({
            user_id: ob.user_id,
            obligation_id: ob.id,
            type: 'Conflict',
            severity: 'High',
            message: msg,
            status: 'pending'
          }).catch(console.error);
        }
      }
    }

    currentDate.setMinutes(currentDate.getMinutes() + 30);
  }

  overloadedDays.forEach(day => {
    const msg = `Move work from overloaded day: ${day}`;
    if (!interventions.find(i => i.message.includes(day))) {
       interventionRepo.create({
          user_id: obligations[0]?.user_id || 'system',
          obligation_id: obligations[0]?.id,
          type: 'Overload',
          severity: 'High',
          message: msg,
          status: 'pending'
       }).catch(console.error);
    }
  });

  return {
    generatedAt: new Date().toISOString(),
    confidence: Math.max(70, 100 - averageRisk),
    overloadedDays,
    criticalWarnings,
    blocks
  };
}
