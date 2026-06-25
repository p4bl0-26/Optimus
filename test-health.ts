import { runIntegrationHealthCheck } from './src/lib/integrations/healthCheck';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env.local') });

async function main() {
  console.log('Running health check...');
  const result = await runIntegrationHealthCheck();
  console.log('Result:', JSON.stringify(result, null, 2));
}

main().catch(console.error);
