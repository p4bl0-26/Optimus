import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve('.env.local') });

async function runDiagnostic() {
  console.log('--- SUPABASE ROOT CAUSE DIAGNOSTIC ---');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('1. Runtime Values:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY length: ${supabaseKey ? supabaseKey.length : 0}`);

  if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables missing!');
    return;
  }

  console.log('\n2. Verifying Client Initialization:');
  let supabase;
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('   Client initialized successfully.');
  } catch (error) {
    console.error('   Client initialization failed:', error);
    return;
  }

  console.log('\n3. Executing Read Query:');
  console.log("   Query: supabase.from('obligations').select('*').limit(1)");
  
  try {
    const { data, error, status, statusText } = await supabase.from('obligations').select('*').limit(1);
    
    if (error) {
      console.error('   Query failed!');
      console.error('   Returned Error Object:', JSON.stringify(error, null, 2));
      console.error(`   HTTP Status: ${status} ${statusText}`);
    } else {
      console.log('   Query successful!');
      console.log(`   Returned Rows Count: ${data ? data.length : 0}`);
    }
  } catch (caughtError: any) {
    console.error('   Exception thrown during query:', caughtError);
    if (caughtError.cause) {
      console.error('   Cause:', caughtError.cause);
    }
  }
}

runDiagnostic().catch(console.error);
