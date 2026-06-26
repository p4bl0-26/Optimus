import { google } from 'googleapis';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GMAIL_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://optimus-gray.vercel.app/api/integrations/gmail/callback';
const CLASSROOM_REDIRECT_URI = process.env.GOOGLE_CLASSROOM_REDIRECT_URI || 'https://optimus-gray.vercel.app/api/integrations/classroom/callback';
const CALENDAR_REDIRECT_URI = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'https://optimus-gray.vercel.app/api/integrations/calendar/callback';

export function getGoogleOAuthClient(redirectUri?: string) {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, redirectUri ?? GMAIL_REDIRECT_URI);
}

// ─── Gmail OAuth ─────────────────────────────────────────────
export function getAuthUrl() {
  const oauth2Client = getGoogleOAuthClient(GMAIL_REDIRECT_URI);
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force consent to ensure we get a refresh token
    scope: scopes,
  });
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getGoogleOAuthClient(GMAIL_REDIRECT_URI);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// ─── Classroom OAuth ─────────────────────────────────────────
// Reuses the same Google OAuth client credentials.
// Scopes required: classroom.courses.readonly + classroom.coursework.me.readonly
export function getClassroomAuthUrl() {
  const oauth2Client = getGoogleOAuthClient(CLASSROOM_REDIRECT_URI);
  const scopes = [
    'https://www.googleapis.com/auth/classroom.courses.readonly',
    'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

export async function getClassroomTokensFromCode(code: string) {
  const oauth2Client = getGoogleOAuthClient(CLASSROOM_REDIRECT_URI);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

// ─── Calendar OAuth ──────────────────────────────────────────
export function getCalendarAuthUrl() {
  const oauth2Client = getGoogleOAuthClient(CALENDAR_REDIRECT_URI);
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events.readonly',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });
}

export async function getCalendarTokensFromCode(code: string) {
  const oauth2Client = getGoogleOAuthClient(CALENDAR_REDIRECT_URI);
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
