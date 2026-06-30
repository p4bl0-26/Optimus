import { NextResponse } from 'next/server';
import { getClassroomAuthUrl } from '@/lib/integrations/googleAuth';

/**
 * GET /api/integrations/classroom/connect
 * Redirects user to Google OAuth consent screen with Classroom scopes.
 * Reuses existing Google OAuth client — same credentials as Gmail.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state') || undefined;
  const url = getClassroomAuthUrl(state);
  return NextResponse.redirect(url);
}
