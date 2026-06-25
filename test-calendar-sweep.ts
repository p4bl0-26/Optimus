import { supabase } from './src/lib/db/supabase';
import { runCalendarDiscoveryAgent } from './src/lib/integrations/calendarDiscoveryAgent';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

async function validate() {
  console.log('--- Checking Integrations Table ---');
  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .eq('provider', 'calendar');
    
  if (error) {
    console.error('Error fetching integrations:', error);
  } else {
    console.log('Integrations found:', integrations.length);
    if (integrations.length > 0) {
      console.log('Provider:', integrations[0].provider);
      console.log('Has access_token:', !!integrations[0].access_token);
      console.log('Has refresh_token:', !!integrations[0].refresh_token);
    } else {
      console.log('NO CALENDAR INTEGRATION FOUND for DEMO_USER_ID. The sweep will likely fail.');
    }
  }

  console.log('\n--- Running Calendar Sweep ---');
  try {
    const result = await runCalendarDiscoveryAgent();
    console.log('Sweep Result:', result);
  } catch (e: any) {
    console.error('Sweep failed:', e.message);
  }
}

validate();
