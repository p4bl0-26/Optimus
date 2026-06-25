import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve('.env.local') });

async function runGeminiDiagnostic() {
  console.log('--- GEMINI ROOT CAUSE DIAGNOSTIC ---');

  // 1. SDK Version
  const pkgJsonPath = path.resolve('package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const sdkVersion = pkg.dependencies['@google/generative-ai'];
  console.log(`1. SDK Version: ${sdkVersion}`);

  // 2. Model Used
  const modelName = "gemini-2.5-flash"; // Currently used in the codebase
  console.log(`2. Model Used: ${modelName}`);

  // 3. Verify API Key
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(`3. API Key Loaded: ${apiKey ? 'YES (Length: ' + apiKey.length + ')' : 'NO'}`);

  if (!apiKey) return;

  // 4. Test
  console.log('\n4. Executing Minimal Test...');
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Reply with the word OPTIMUS only.");
    console.log('   Result:', result.response.text());
  } catch (err: any) {
    console.error('   Error Caught:', err.message);
  }
}

runGeminiDiagnostic().catch(console.error);
