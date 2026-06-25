import * as dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve('.env.local') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Actually, there's no native listModels in the base sdk, let's just make a REST call to see.
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  console.log('Available models:', data.models.map((m: any) => m.name));
}

listModels().catch(console.error);
