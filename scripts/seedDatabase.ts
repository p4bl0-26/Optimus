import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

function addHours(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function addDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

const DEMO_DATA = [
  {
    id: 'hackathon-submission',
    title: 'Hackathon Submission',
    description: 'Final submission including demo video, code repository, and presentation deck for the OPTIMUS hackathon.',
    due_date: addHours(48).toISOString(),
    priority: 'Critical',
    progress: 60,
  },
  {
    id: 'dbms-assignment',
    title: 'DBMS Assignment',
    description: 'Database management systems assignment covering normalization, indexing, and SQL queries.',
    due_date: addDays(5).toISOString(),
    priority: 'High',
    progress: 20,
  },
  {
    id: 'internship-assessment',
    title: 'Internship Assessment',
    description: 'Online coding assessment for the summer software engineering internship role.',
    due_date: addDays(3).toISOString(),
    priority: 'High',
    progress: 40,
  },
  {
    id: 'feedback-form',
    title: 'Feedback Form',
    description: 'Course evaluation feedback form for the current semester.',
    due_date: addDays(1).toISOString(),
    priority: 'Low',
    progress: 0,
  },
  {
    id: 'bank-kyc-renewal',
    title: 'Bank KYC Renewal',
    description: 'Update Know Your Customer (KYC) documentation for the primary savings account.',
    due_date: addDays(7).toISOString(),
    priority: 'Medium',
    progress: 10,
  },
];

async function seed() {
  console.log('Seeding Demo Workspace Data...');
  
  // 1. Ensure User exists (even if we are skipping auth, we need the record for FKs)
  const { data: existingUser } = await supabase.from('users').select('id').eq('id', DEMO_USER_ID).single();
  
  if (!existingUser) {
    const { error } = await supabase.from('users').insert({
      id: DEMO_USER_ID,
      email: 'demo@optimus.ai',
      role: 'demo'
    });
    if (error) console.error('Error creating user:', error);
  }

  // 2. Insert Obligations and Risk Profiles
  for (const item of DEMO_DATA) {
    // Upsert Obligation
    const { data: obData, error: obError } = await supabase.from('obligations').upsert({
      user_id: DEMO_USER_ID,
      title: item.title,
      description: item.description,
      status: 'active',
      type: 'assignment',
      priority: item.priority.toLowerCase(),
      due_date: item.due_date,
      source: 'demo'
    }).select('id').single();

    if (obError) {
      console.error('Error inserting obligation:', item.title, obError);
      continue;
    }

    // Upsert associated Risk Profile (storing progress in future_outcomes to satisfy UI constraints temporarily or mapping it)
    const { error: rpError } = await supabase.from('risk_profiles').upsert({
      user_id: DEMO_USER_ID,
      obligation_id: obData.id,
      risk_score: item.progress > 50 ? 20 : 80, // Fake score
      risk_band: item.priority === 'Critical' ? 'Critical' : 'Monitor',
      reasoning: 'Demo reasoning seeded from database.',
      recommended_focus: 'Focus on completing this task.',
      future_outcomes: { progress: item.progress } // Storing progress here!
    });

    if (rpError) {
      console.error('Error inserting risk profile:', item.title, rpError);
    }
  }

  console.log('Demo Data Seed Complete!');
}

seed().catch(console.error);
