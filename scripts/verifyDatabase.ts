import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

async function verifyAndSeed() {
  const results: any = {
    tablesVerified: [],
    seedStatus: {},
    crudTest: {}
  };

  try {
    // 1. Verify Tables by doing a lightweight select
    const tables = ['users', 'obligations', 'risk_profiles', 'interventions', 'agent_memory', 'agent_activity', 'briefings', 'accountability_partners', 'integrations'];
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (!error) {
        results.tablesVerified.push(table);
      } else {
        console.error(`Table ${table} verification failed:`, error);
      }
    }

    // 2. Seed Data
    // User
    const { error: userError } = await supabase.from('users').upsert({ id: DEMO_USER_ID, email: 'demo@optimus.ai', role: 'demo' });
    results.seedStatus.user = !userError;

    // Obligations (5)
    const obs = [];
    for (let i = 1; i <= 5; i++) {
      const { data } = await supabase.from('obligations').upsert({
        id: `00000000-0000-0000-0000-00000000000${i}`,
        user_id: DEMO_USER_ID,
        title: `Demo Obligation ${i}`,
        status: 'pending',
        type: 'assignment',
        priority: 'high'
      }).select().single();
      if (data) obs.push(data);
    }
    results.seedStatus.obligations = obs.length;

    // Risk Profiles (5)
    let rpCount = 0;
    for (const ob of obs) {
      const { error } = await supabase.from('risk_profiles').upsert({
        user_id: DEMO_USER_ID,
        obligation_id: ob.id,
        risk_score: 50,
        risk_band: 'Monitor',
        reasoning: 'System verified reasoning.'
      });
      if (!error) rpCount++;
    }
    results.seedStatus.risk_profiles = rpCount;

    // Briefings (2)
    let brCount = 0;
    for (let i = 1; i <= 2; i++) {
      const { error } = await supabase.from('briefings').insert({
        user_id: DEMO_USER_ID,
        briefing_type: i === 1 ? 'morning' : 'evening',
        content: { summary: "All systems nominal." }
      });
      if (!error) brCount++;
    }
    results.seedStatus.briefings = brCount;

    // Interventions (5)
    let intCount = 0;
    for (let i = 1; i <= 5; i++) {
      const { error } = await supabase.from('interventions').insert({
        user_id: DEMO_USER_ID,
        obligation_id: obs[0].id,
        type: 'notification',
        severity: 'medium',
        message: 'Intervention test'
      });
      if (!error) intCount++;
    }
    results.seedStatus.interventions = intCount;

    // Agent Activity (10)
    let aaCount = 0;
    for (let i = 1; i <= 10; i++) {
      const { error } = await supabase.from('agent_activity').insert({
        agent_name: 'RiskAgent',
        user_id: DEMO_USER_ID,
        obligation_id: obs[0].id,
        action: 'VERIFY'
      });
      if (!error) aaCount++;
    }
    results.seedStatus.agent_activity = aaCount;

    // Accountability Partner (1)
    const { error: apError } = await supabase.from('accountability_partners').insert({
      user_id: DEMO_USER_ID,
      name: 'Agent Optimus',
      email: 'optimus@optimus.ai',
      phone: '555-0100'
    });
    results.seedStatus.accountability_partners = apError ? 0 : 1;

    // 3. CRUD Verification on Obligations
    // CREATE
    const { data: createData, error: createError } = await supabase.from('obligations').insert({
      user_id: DEMO_USER_ID,
      title: 'CRUD Test Obligation',
      status: 'pending'
    }).select().single();
    results.crudTest.create = !createError && !!createData;

    if (createData) {
      // READ
      const { data: readData, error: readError } = await supabase.from('obligations').select('*').eq('id', createData.id).single();
      results.crudTest.read = !readError && readData?.id === createData.id;

      // UPDATE
      const { data: updateData, error: updateError } = await supabase.from('obligations').update({ status: 'active' }).eq('id', createData.id).select().single();
      results.crudTest.update = !updateError && updateData?.status === 'active';

      // DELETE
      const { error: deleteError } = await supabase.from('obligations').delete().eq('id', createData.id);
      results.crudTest.delete = !deleteError;
    }

    console.log(JSON.stringify(results, null, 2));

  } catch (err) {
    console.error("Verification failed:", err);
  }
}

verifyAndSeed();
