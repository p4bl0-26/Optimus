export interface User {
  id: string;
  email?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Obligation {
  id: string;
  user_id: string;
  source: string;
  source_id?: string;
  title: string;
  description?: string;
  status: string;
  type: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RiskProfile {
  id: string;
  user_id: string;
  obligation_id: string;
  risk_score: number;
  risk_band: string;
  reasoning?: string;
  recommended_focus?: string;
  missing_work?: string;
  future_outcomes?: any;
  created_at: string;
  updated_at: string;
}

export interface Intervention {
  id: string;
  user_id: string;
  obligation_id: string;
  type: string;
  severity: string;
  message: string;
  status: string;
  created_at: string;
}

export interface AgentMemory {
  id: string;
  user_id: string;
  agent_name: string;
  memory_type: string;
  content: any;
  created_at: string;
  updated_at: string;
}

export interface AgentActivity {
  id: string;
  agent_name: string;
  user_id: string;
  obligation_id?: string;
  action: string;
  metadata?: any;
  created_at: string;
}

export interface Briefing {
  id: string;
  user_id: string;
  briefing_type: string;
  content?: any;
  read_status: boolean;
  generated_at?: string;
  created_at: string;
}
