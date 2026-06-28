import { fetchDashboardStateAction } from '@/app/actions/optimus'
import { generateWeeklyReport } from '@/lib/intelligence/weeklyReportEngine'
import { WeeklyReportClient } from '@/components/reports/WeeklyReportClient'
import { PageContainer } from '@/components/layout/PageContainer'
import { AlertTriangle } from 'lucide-react'
import { agentMemoryRepo } from '@/lib/repositories'

export const dynamic = 'force-dynamic'

export default async function WeeklyReportsPage() {
  let dashboardState;
  let report = null;
  let errorMsg = null;

  try {
    dashboardState = await fetchDashboardStateAction()
    if (dashboardState) {
      const { getActiveUserId } = await import('@/lib/auth')
      const userId = await getActiveUserId()
      const memories = userId ? await agentMemoryRepo.findAll({ user_id: userId }) : []
      
      report = await generateWeeklyReport(
        dashboardState.obligations,
        dashboardState.riskProfiles.filter(Boolean) as any,
        dashboardState.interventions,
        memories,
        dashboardState.events
      )
    }
  } catch (error: any) {
    errorMsg = error?.message || 'Failed to initialize Weekly Report.'
  }

  if (errorMsg || !dashboardState || !report) {
    return (
      <PageContainer id="reports-error">
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertTriangle size={32} className="text-[var(--color-risk-critical)]" />
          <h2 className="text-lg font-bold text-[var(--color-risk-critical)] font-orbitron">Intelligence Core Offline</h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md text-center">
            {errorMsg || 'Insufficient operational history to generate executive assessments.'}
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer id="weekly-reports-page">
      <WeeklyReportClient report={report} />
    </PageContainer>
  )
}
