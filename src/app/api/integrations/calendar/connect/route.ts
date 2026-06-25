import { NextResponse } from 'next/server';
import { getCalendarAuthUrl } from '@/lib/integrations/googleAuth';

/**
 * GET /api/integrations/calendar/connect
 * Redirects user to Google OAuth consent screen with Calendar scopes.
 */
export async function GET() {
  const url = getCalendarAuthUrl();
  return NextResponse.redirect(url);
}
