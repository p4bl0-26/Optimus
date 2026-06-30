import { NextResponse } from 'next/server';
import { getCalendarAuthUrl } from '@/lib/integrations/googleAuth';

/**
 * GET /api/integrations/calendar/connect
 * Redirects user to Google OAuth consent screen with Calendar scopes.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || undefined;
  const url = getCalendarAuthUrl(state);
  return NextResponse.redirect(url);
}
