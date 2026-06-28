import { commandCenterRepo } from '@/lib/repositories/CommandCenterRepository';
import { generateWeeklySchedule } from '@/lib/intelligence/autonomousScheduler';
import { getActivePatterns } from '@/lib/intelligence/memoryEngine';
import { ScheduleClient } from '@/components/schedule/ScheduleClient';
import { PageContainer } from '@/components/layout/PageContainer';
import { SectionContainer } from '@/components/layout/SectionContainer';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

export default async function SchedulePage() {
  // Fetch unified state
  const state = await commandCenterRepo.getDashboardState(DEMO_USER_ID);
  
  // Fetch memory patterns
  const memoryPatterns = await getActivePatterns();

  // Generate schedule
  const schedule = await generateWeeklySchedule(
    state.obligations,
    state.riskProfiles as any,
    state.interventions,
    memoryPatterns,
    state.strategicRecommendations
  );

  return (
    <PageContainer id="autonomous-schedule-page">
      <SectionContainer spacing="none">
        <ScheduleClient 
          schedule={schedule} 
          recommendations={state.strategicRecommendations} 
        />
      </SectionContainer>
    </PageContainer>
  );
}
