import { supabase } from '../db/supabase';
import { RiskProfile } from '@/types/database';
import { 
  obligationRepo, 
  riskProfileRepo, 
  interventionRepo,
  agentActivityRepo,
  briefingRepo
} from './index';
import { generateChiefOfStaffBriefing } from '../intelligence/chiefOfStaffEngine';

export class CommandCenterRepository {
  async getDashboardState(userId: string) {
    // Execute all queries in parallel for maximum performance
    const [
      obligations,
      allRiskProfiles,
      interventions,
      agentActivity,
      briefings,
      gmailIntegrationResponse,
      classroomIntegrationResponse,
      calendarIntegrationResponse,
    ] = await Promise.all([
      obligationRepo.findByUser(userId),
      // Fetch risk profiles for all obligations belonging to this user
      this.fetchRiskProfilesForObligations(userId),
      interventionRepo.findActiveByUser(userId),
      agentActivityRepo.findAll({ user_id: userId }),
      briefingRepo.findAll({ user_id: userId, briefing_type: 'morning' }),
      supabase.from('integrations').select('*').eq('user_id', userId).eq('provider', 'gmail').single(),
      supabase.from('integrations').select('id, status').eq('user_id', userId).eq('provider', 'classroom').single(),
      supabase.from('integrations').select('id, status').eq('user_id', userId).eq('provider', 'calendar').single(),
    ]);

    const latestBriefing = briefings.sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0] || null;

    const gmailIntegration = gmailIntegrationResponse?.data;
    const classroomIntegration = classroomIntegrationResponse?.data;
    const calendarIntegration = calendarIntegrationResponse?.data;

    const chiefOfStaffBriefing = await generateChiefOfStaffBriefing(
      obligations,
      allRiskProfiles.filter(Boolean) as RiskProfile[],
      interventions,
      agentActivity
    );

    return {
      obligations,
      riskProfiles: allRiskProfiles,
      interventions,
      events: agentActivity,
      briefing: latestBriefing, // Still keeping this for historical fallback if needed
      isGmailConnected: !!gmailIntegration,
      gmailAccountEmail: gmailIntegration?.provider_id || undefined,
      isClassroomConnected: !!classroomIntegration,
      isCalendarConnected: !!calendarIntegration,
      ...chiefOfStaffBriefing,
    };
  }

  private async fetchRiskProfilesForObligations(userId: string) {
    // In a real app we'd add findByUser to riskProfileRepo, but for now:
    const obligations = await obligationRepo.findByUser(userId);
    const profiles = await Promise.all(
      obligations.map(ob => riskProfileRepo.findByObligation(ob.id))
    );
    return profiles.filter(Boolean);
  }
}

export const commandCenterRepo = new CommandCenterRepository();
