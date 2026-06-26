import { BaseRepository } from './BaseRepository';
import { supabase } from '../db/supabase';
import { 
  Obligation, 
  RiskProfile, 
  Intervention, 
  AgentActivity, 
  AgentMemory, 
  Briefing 
} from '../../types/database';

export class ObligationRepo extends BaseRepository<Obligation> {
  constructor() {
    super('obligations');
  }

  async findByUser(userId: string): Promise<Obligation[]> {
    return this.findAll({ user_id: userId });
  }

  async findPendingByUser(userId: string): Promise<Obligation[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending');
      
    if (error) {
      console.log('[FAIL] Error in findPendingByUser:', error.message);
      return [];
    }
    return data as Obligation[];
  }
}

export class RiskProfileRepo extends BaseRepository<RiskProfile> {
  constructor() {
    super('risk_profiles');
  }

  async findByObligation(obligationId: string): Promise<RiskProfile | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('obligation_id', obligationId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.log('[FAIL] Error in findByObligation:', error.message);
      }
      return null;
    }
    return data as RiskProfile;
  }
}

export class InterventionRepo extends BaseRepository<Intervention> {
  constructor() {
    super('interventions');
  }

  async findActiveByUser(userId: string): Promise<Intervention[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.log('[FAIL] Error in findActiveByUser:', error.message);
      return [];
    }
    return data as Intervention[];
  }
}

export class AgentActivityRepo extends BaseRepository<AgentActivity> {
  constructor() {
    super('agent_activity');
  }
}

export class AgentMemoryRepo extends BaseRepository<AgentMemory> {
  constructor() {
    super('agent_memory');
  }
}

export class BriefingRepo extends BaseRepository<Briefing> {
  constructor() {
    super('briefings');
  }
}

export const obligationRepo = new ObligationRepo();
export const riskProfileRepo = new RiskProfileRepo();
export const interventionRepo = new InterventionRepo();
export const agentActivityRepo = new AgentActivityRepo();
export const agentMemoryRepo = new AgentMemoryRepo();
export const briefingRepo = new BriefingRepo();
