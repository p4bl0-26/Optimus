import { fetchDashboardStateAction } from '@/app/actions/optimus'
import { FocusModeClient } from '@/components/focus/FocusModeClient'
import { PageContainer } from '@/components/layout/PageContainer'
import { AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function FocusModePage() {
  let dashboardState;
  let errorMsg = null;

  try {
    dashboardState = await fetchDashboardStateAction()
  } catch (error: any) {
    errorMsg = error?.message || 'Failed to initialize Focus Mode.'
  }

  if (errorMsg || !dashboardState) {
    return (
      <PageContainer id="focus-mode-error">
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <AlertTriangle size={32} className="text-[var(--color-risk-critical)]" />
          <h2 className="text-lg font-bold text-[var(--color-risk-critical)]">Focus Core Offline</h2>
          <p className="text-sm text-[var(--color-text-muted)] max-w-md text-center">
            {errorMsg}
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer id="focus-mode-page">
      <FocusModeClient 
        obligations={dashboardState.obligations}
        riskProfiles={dashboardState.riskProfiles}
        recommendedFocus={dashboardState.recommendedFocus}
      />
    </PageContainer>
  )
}
