import { useState, useEffect } from 'react'
import { Obligation, RiskProfile, Intervention, Briefing } from '@/types/database'
import { StrategicRecommendation, RecommendedFocus } from '@/types'
import { fetchDashboardStateAction } from '@/app/actions/optimus'

export type AgentState = 'IDLE' | 'SCANNING' | 'ANALYZING' | 'UPDATING' | 'COMPLETE' | 'ACTIVE'

export interface SimulationEvent {
  id: string
  timestamp: Date
  message: string
  type: 'info' | 'alert' | 'success' | 'system'
}

export interface AgentStates {
  Discovery: AgentState
  Risk: AgentState
  Briefing: AgentState
  Future: AgentState
}

export function useSimulationEngine() {
  const [obligations, setObligations] = useState<any[]>([])  
  const [riskProfiles, setRiskProfiles] = useState<any[]>([])  
  const [interventions, setInterventions] = useState<any[]>([])  
  const [events, setEvents] = useState<SimulationEvent[]>([])
  const [briefing, setBriefing] = useState<any>(null)  
  
  const [isGmailConnected, setIsGmailConnected] = useState<boolean>(false)
  const [gmailAccountEmail, setGmailAccountEmail] = useState<string | undefined>(undefined)
  const [isClassroomConnected, setIsClassroomConnected] = useState<boolean>(false)
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean>(false)

  // Chief of Staff Layer States
  const [executiveSummary, setExecutiveSummary] = useState<string>('')
  const [morningBriefing, setMorningBriefing] = useState<string>('')
  const [eveningBriefing, setEveningBriefing] = useState<string>('')
  const [highestRiskTarget, setHighestRiskTarget] = useState<string>('None')
  const [recommendedFocus, setRecommendedFocus] = useState<RecommendedFocus | null>(null)
  const [strategicRecommendations, setStrategicRecommendations] = useState<StrategicRecommendation[]>([])
  const [overloadedDays, setOverloadedDays] = useState<string[]>([])

  const [agentStates, setAgentStates] = useState<AgentStates>({
    Discovery: 'IDLE',
    Risk: 'IDLE',
    Briefing: 'IDLE',
    Future: 'IDLE'
  })
  
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSupabaseData() {
      try {
        setLoading(true)
        setError(null)

        // Single call to the aggregated dashboard state repository
        const state = await fetchDashboardStateAction()

        setObligations(state.obligations)
        setRiskProfiles(state.riskProfiles)
        setInterventions(state.interventions)
        setBriefing(state.briefing)
        setIsGmailConnected(state.isGmailConnected)
        setGmailAccountEmail(state.gmailAccountEmail)
        setIsClassroomConnected(state.isClassroomConnected ?? false)
        setIsCalendarConnected(state.isCalendarConnected ?? false)

        setExecutiveSummary(state.executiveSummary ?? '')
        setMorningBriefing(state.morningBriefing ?? '')
        setEveningBriefing(state.eveningBriefing ?? '')
        setHighestRiskTarget(state.highestRiskTarget ?? 'None')
        setRecommendedFocus(state.recommendedFocus ?? null)
        setStrategicRecommendations(state.strategicRecommendations ?? [])
        setOverloadedDays(state.overloadedDays ?? [])

        // Map agent activity to simulation events
        const mappedEvents = state.events.map((a: any) => ({  
          id: a.id,
          timestamp: new Date(a.created_at),
          message: `${a.agent_name}: ${a.action}`,
          type: 'system' as const
        }))
        
        // Add an initialization event
        setEvents([
          {
            id: `evt-init-${Date.now()}`,
            timestamp: new Date(),
            message: 'OPTIMUS Intelligence Core connected to Supabase backend.',
            type: 'success'
          },
          ...mappedEvents
        ])

        setAgentStates(prev => ({
          ...prev,
          Discovery: (state.isGmailConnected || state.isClassroomConnected || state.isCalendarConnected) ? 'ACTIVE' : 'IDLE',
          Risk: 'COMPLETE',
          Briefing: 'COMPLETE',
          Future: 'COMPLETE'
        }))
      } catch (err: any) {  
        console.log('Supabase fetch failed:', err)
        setError('Intelligence Core Offline - Database Connection Failed')
      } finally {
        setLoading(false)
      }
    }

    loadSupabaseData()
    // Periodic random state shifts have been removed so UI reflects actual system state.
  }, [])

  return { 
    obligations, 
    riskProfiles, 
    interventions, 
    events, 
    briefing, 
    agentStates, 
    loading, 
    error,
    isGmailConnected,
    gmailAccountEmail,
    isClassroomConnected,
    isCalendarConnected,
    executiveSummary,
    morningBriefing,
    eveningBriefing,
    highestRiskTarget,
    recommendedFocus,
    strategicRecommendations,
    overloadedDays
  }
}
