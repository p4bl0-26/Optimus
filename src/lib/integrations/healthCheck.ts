import { getGoogleOAuthClient } from './googleAuth';
import { supabase } from '../db/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { google } from 'googleapis';

const DEMO_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function runIntegrationHealthCheck() {
  const status = {
    gmailOAuth: 'FAIL',
    gmailToken: 'FAIL',
    gmailFetch: 'FAIL',
    geminiConnection: 'FAIL',
    supabaseConnection: 'FAIL',
    overallStatus: 'FAIL',
    errorDetails: [] as string[]
  };

  console.log('[HEALTH CHECK] Initiating phase 4 validation...');

  // 1. Check Google OAuth Credentials
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    status.gmailOAuth = 'PASS';
  } else {
    status.errorDetails.push('Missing Google OAuth Credentials in environment variables.');
  }

  // 2. Check Supabase Connection (write permission simulation or simple fetch)
  try {
    const { error } = await supabase.from('integrations').select('id').limit(1);
    if (error) throw error;
    status.supabaseConnection = 'PASS';
  } catch (err: any) {
    status.errorDetails.push(`Supabase connection failed: ${err.message}`);
  }

  // 3. Check Gmail Token
  let integrationData = null;
  if (status.supabaseConnection === 'PASS') {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('access_token, refresh_token')
        .eq('user_id', DEMO_USER_ID)
        .eq('provider', 'gmail')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned, which means no token
        throw error;
      }
      
      if (data?.access_token) {
        integrationData = data;
        status.gmailToken = 'PASS';
      } else {
        status.errorDetails.push('Gmail access token is missing in the database.');
      }
    } catch (err: any) {
      status.errorDetails.push(`Gmail token lookup failed: ${err.message}`);
    }
  }

  // 4. Check Gmail Fetch (requires token)
  if (status.gmailToken === 'PASS' && integrationData) {
    try {
      const oauth2Client = getGoogleOAuthClient();
      oauth2Client.setCredentials({
        access_token: integrationData.access_token,
        refresh_token: integrationData.refresh_token,
      });
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      await gmail.users.getProfile({ userId: 'me' });
      status.gmailFetch = 'PASS';
    } catch (err: any) {
      status.errorDetails.push(`Gmail API fetch failed: ${err.message}`);
    }
  } else {
    status.errorDetails.push('Skipping Gmail Fetch check due to missing token.');
  }

  // 5. Check Gemini Connection
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent("Ping. Reply with exactly 'Pong'.");
      const text = result.response.text();
      if (text.toLowerCase().includes('pong')) {
        status.geminiConnection = 'PASS';
      } else {
         status.errorDetails.push(`Gemini returned unexpected response: ${text}`);
      }
    } catch (err: any) {
      status.errorDetails.push(`Gemini API connection failed: ${err.message}`);
    }
  } else {
    status.errorDetails.push('Missing Gemini API Key in environment variables.');
  }

  // Overall Status
  if (
    status.gmailOAuth === 'PASS' &&
    status.gmailToken === 'PASS' &&
    status.gmailFetch === 'PASS' &&
    status.geminiConnection === 'PASS' &&
    status.supabaseConnection === 'PASS'
  ) {
    status.overallStatus = 'PASS';
  }

  console.log(`[HEALTH CHECK] Overall Status: ${status.overallStatus}`);
  if (status.errorDetails.length > 0) {
    console.warn('[HEALTH CHECK] Issues Found:', status.errorDetails);
  }

  return status;
}
