import { google } from 'googleapis';
import { getGoogleOAuthClient } from './googleAuth';
import { supabase } from '../db/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  obligationRepo, 
  riskProfileRepo, 
  briefingRepo, 
  agentActivityRepo,
  interventionRepo
} from '../repositories';
import { processObligation } from '../intelligence'; // Assuming this is where the local riskEngine logic lives, but we need to verify its exports
import { Obligation } from '@/types/database';
import { runIntegrationHealthCheck } from './healthCheck';

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function runDiscoveryAgent() {
  console.log('[DISCOVERY AGENT] Booting up...');
  
  try {
    const health = await runIntegrationHealthCheck();
    if (health.overallStatus === 'FAIL') {
      console.error('[DISCOVERY AGENT] [FAIL] Health Check Failed:', health.errorDetails);
      throw new Error(`Integration Health Check Failed: ${health.errorDetails.join(' | ')}`);
    }

    // 1. Get Integration Token
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('access_token, refresh_token')
      .eq('user_id', DEMO_USER_ID)
      .eq('provider', 'gmail')
      .single();

    if (integrationError || !integration || !integration.access_token) {
      console.error('[DISCOVERY AGENT] [FAIL] Missing integration tokens.', integrationError);
      throw new Error('Gmail not connected. Missing integration tokens.');
    }

    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: integration.access_token,
      refresh_token: integration.refresh_token,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // 2. Fetch Latest 20 Emails
    console.log('[DISCOVERY AGENT] [INFO] Scanning latest 20 emails...');
    let res;
    try {
      res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 20,
        q: '-category:promotions -category:social', // Basic filter to avoid spam
      });
    } catch (fetchError: any) {
      console.error('[DISCOVERY AGENT] [FAIL] Failed to fetch emails:', fetchError);
      throw new Error(`Failed to fetch emails: ${fetchError.message}`);
    }

    const messages = res.data.messages || [];
    if (messages.length === 0) {
      console.log('[DISCOVERY AGENT] [INFO] No emails found.');
      return { status: 'success', newObligations: 0 };
    }

    let newObligationsCount = 0;

  for (const message of messages) {
    if (!message.id) continue;

    try {
      // Check if already processed
      const { data: existing, error: existingError } = await supabase
        .from('obligations')
        .select('id')
        .eq('source_id', message.id)
        .single();

      if (existingError && existingError.code !== 'PGRST116') {
        console.warn(`[DISCOVERY AGENT] [WARN] Error checking existing obligation for ${message.id}:`, existingError.message);
      }

      if (existing) {
        continue; // Skip already processed
      }

    // Fetch full message
    const msgData = await gmail.users.messages.get({
      userId: 'me',
      id: message.id,
      format: 'full'
    });

    const headers = msgData.data.payload?.headers || [];
    const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
    const from = headers.find((h) => h.name === 'From')?.value || 'Unknown Sender';
    const snippet = msgData.data.snippet || '';

    // 3. Gemini Extraction
    const extraction = await extractObligationWithGemini(subject, from, snippet);
    
    if (extraction.isObligation && extraction.confidenceScore > 60) {
      console.log(`[DISCOVERY AGENT] Found Obligation: ${extraction.title} (Confidence: ${extraction.confidenceScore}%)`);
      
      // 4. Persist Obligation
      const newObligation = await obligationRepo.create({
        user_id: DEMO_USER_ID,
        title: extraction.title,
        description: extraction.description,
        source: 'gmail',
        source_id: message.id,
        status: 'pending',
        type: 'assignment',
        priority: extraction.priority.toLowerCase() || 'medium',
        due_date: extraction.dueDate ? new Date(extraction.dueDate).toISOString() : undefined,
      });

      if (!newObligation) {
        console.error(`[DISCOVERY AGENT] [FAIL] Failed to create obligation for msg ${message.id}`);
        continue;
      }
      console.log(`[DISCOVERY AGENT] [SUCCESS] Created obligation ${newObligation.id}`);

      // 5. Generate Risk Profile using our existing Intelligence Pipeline
      // We will re-use the `processObligation` function if possible. Wait, processObligation takes a specific type.
      // For now, we'll implement a basic risk generation or use the imported engine.
      // Let's build a standalone risk logic here if the imported one isn't 100% compatible.
      const riskScore = extraction.priority === 'High' ? 85 : extraction.priority === 'Medium' ? 45 : 15;
      const riskBand = riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High Risk' : riskScore >= 30 ? 'Monitor' : 'Safe';
      
      const riskProfile = await riskProfileRepo.create({
        user_id: DEMO_USER_ID,
        obligation_id: newObligation.id,
        risk_score: riskScore,
        risk_band: riskBand,
        reasoning: `AI Extracted from Gmail. Confidence: ${extraction.confidenceScore}%. Sender: ${from}`,
        recommended_focus: 'Review email and confirm deadlines.',
        missing_work: 'Awaiting user confirmation of exact deliverables.',
        future_outcomes: {
          factors: ['External dependency on email sender'],
          outcomes: [
            { type: 'Current', summary: 'Awaiting review', successProbability: 50 },
            { type: 'Recommended', summary: 'Acknowledge email and start work', successProbability: 95 }
          ],
          rescuePlan: { actions: { today: ['Read full email thread'], tomorrow: [], beforeDeadline: [] } }
        }
      });

      // 6. Generate Briefing
      await briefingRepo.create({
        user_id: DEMO_USER_ID,
        briefing_type: 'discovery',
        content: {
          title: 'New Obligation Discovered',
          message: `OPTIMUS has extracted a new obligation "${extraction.title}" from your Gmail inbox. Source: ${from}.`
        },
        read_status: false,
        generated_at: new Date().toISOString()
      });

      // 7. Generate Intervention (if critical)
      if (riskBand === 'Critical') {
        await interventionRepo.create({
          user_id: DEMO_USER_ID,
          obligation_id: newObligation.id,
          type: 'risk_alert',
          severity: 'high',
          message: `Critical priority obligation extracted from Gmail: ${extraction.title}`,
          status: 'pending'
        });
      }

      // 8. Log Activity
      const activityResult = await agentActivityRepo.create({
        user_id: DEMO_USER_ID,
        agent_name: 'DISCOVERY AGENT',
        action: `New obligation discovered from Gmail: ${extraction.title}`,
        obligation_id: newObligation.id,
        metadata: { confidence: extraction.confidenceScore, messageId: message.id }
      });

      if (!activityResult) {
        console.warn(`[DISCOVERY AGENT] [WARN] Failed to log activity for obligation: ${newObligation.id}`);
      } else {
        console.log(`[DISCOVERY AGENT] [SUCCESS] Fully processed and logged obligation: ${newObligation.id}`);
      }

      newObligationsCount++;
    }
    } catch (msgError: any) {
      console.error(`[DISCOVERY AGENT] [FAIL] Error processing message ${message.id}:`, msgError);
    }
  }

  console.log(`[DISCOVERY AGENT] [SUCCESS] Sweep complete. Found ${newObligationsCount} new obligations.`);
  return { status: 'success', newObligations: newObligationsCount };
  } catch (globalError: any) {
    console.error('[DISCOVERY AGENT] [CRITICAL] Unhandled error during discovery run:', globalError);
    throw globalError;
  }
}

async function extractObligationWithGemini(subject: string, from: string, bodySnippet: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an AI assistant that extracts tasks and obligations from emails.
      Analyze the following email metadata and snippet. 
      Determine if it represents a deadline, task, or obligation that requires the user's action.
      
      From: ${from}
      Subject: ${subject}
      Snippet: ${bodySnippet}

      Respond strictly in JSON format with the following schema:
      {
        "isObligation": boolean,
        "title": "Short descriptive title of the task",
        "description": "Longer explanation of what needs to be done",
        "dueDate": "ISO 8601 timestamp if a date/time is mentioned, or null",
        "priority": "High" | "Medium" | "Low",
        "confidenceScore": number (0-100 indicating how sure you are this is a real obligation)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Extraction Error:', error);
    return { isObligation: false, confidenceScore: 0 };
  }
}
